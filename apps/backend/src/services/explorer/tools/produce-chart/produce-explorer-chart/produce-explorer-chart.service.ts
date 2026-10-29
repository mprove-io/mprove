import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { DbService } from '#backend/services/db/db.service';
import {
  ExplorerChartRebuildService,
  type ExplorerRebuildOk
} from '#backend/services/explorer/explorer-chart-rebuild/explorer-chart-rebuild.service';
import { ExplorerEventsMakerService } from '#backend/services/explorer/explorer-events-maker/explorer-events-maker.service';
import { SessionDrainService } from '#backend/services/session/session-drain/session-drain.service';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendSessionTypeIsNotExplorerError } from '#common/types/backend/errors/backend-session-type-is-not-explorer-error';
import type { BackendUnauthorizedError } from '#common/types/backend/errors/backend-unauthorized-error';
import type { ProduceExplorerChartError } from '#common/types/backend/function-errors/produce-explorer-chart-error';
import type { SessionTabCreatedEvent } from '#common/types/backend/parts/session/session-tab-created-event';
import type { ToBackendProduceExplorerChartOutput } from '#common/types/backend/routes/charts/produce-explorer-chart/produce-explorer-chart-output';

export const CHART_ID_PLACEHOLDER = '<chart-id-placeholder>';

@Injectable()
export class ProduceExplorerChartService {
  constructor(
    private explorerChartRebuildService: ExplorerChartRebuildService,
    private explorerEventsMakerService: ExplorerEventsMakerService,
    private sessionDrainService: SessionDrainService,
    private runQueriesService: RunQueriesService,
    private db: DbService
  ) {}

  async produceExplorerChart(item: {
    user: UserTab;
    traceId: string;
    sessionId: string;
    modelId: string;
    chartYaml: string;
    title: string;
  }): Result.ResultAsync<
    ToBackendProduceExplorerChartOutput,
    ProduceExplorerChartError
  > {
    let { chartYaml } = item;

    // This existing validation returns chart errors before session lookup.
    if (chartYaml.indexOf(CHART_ID_PLACEHOLDER) < 0) {
      let output: ToBackendProduceExplorerChartOutput = {
        status: 'error',
        errors: [
          {
            title: 'Missing chart id placeholder',
            message: `chartYaml must contain ${CHART_ID_PLACEHOLDER} as the chart id placeholder. Put it in the top-level chart field.`,
            lines: []
          }
        ]
      };

      return Result.succeed(output);
    }

    return Result.pipe(
      Result.succeed({
        ...item,
        chartId: makeId()
      }),
      Result.bind('preparedChartYaml', v =>
        Result.succeed(v.chartYaml.split(CHART_ID_PLACEHOLDER).join(v.chartId))
      ),
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, v.sessionId)
        })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.user.userId
          ? Result.fail({
              code: 'BACKEND_UNAUTHORIZED'
            } satisfies BackendUnauthorizedError)
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.type !== 'Explorer'
          ? Result.fail({
              code: 'BACKEND_SESSION_TYPE_IS_NOT_EXPLORER'
            } satisfies BackendSessionTypeIsNotExplorerError)
          : Result.succeed()
      ),
      Result.bind('rebuild', v =>
        this.explorerChartRebuildService.rebuildFromYaml({
          traceId: v.traceId,
          session: v.session,
          chartId: v.chartId,
          modelId: v.modelId,
          chartYaml: v.preparedChartYaml
        })
      ),
      Result.map(v => {
        if (v.rebuild.ok === true) {
          v.rebuild.chart.title = v.title;
        }

        return v;
      }),
      Result.andThrough(async v => {
        if (v.rebuild.ok === false) {
          return Result.succeed();
        }

        let rebuild: ExplorerRebuildOk = v.rebuild;

        return this.db.write({
          insert: {
            charts: [rebuild.chart],
            mconfigs: [rebuild.mconfig]
          },
          insertOrDoNothing: { queries: [rebuild.query] }
        });
      }),
      Result.andThrough(async v =>
        v.rebuild.ok === false
          ? Result.succeed()
          : this.runQueriesService.runQueries({
              user: v.user,
              projectId: v.session.projectId,
              repoId: v.session.repoId,
              branchId: v.session.branchId,
              envId: v.session.envId,
              mconfigIds: [v.rebuild.mconfig.mconfigId]
            })
      ),
      Result.bind('tabId', v =>
        Result.succeed(v.rebuild.ok === false ? undefined : makeId())
      ),
      Result.andThrough(v => {
        if (v.rebuild.ok === true) {
          let tabEvent: SessionTabCreatedEvent =
            this.explorerEventsMakerService.makeChartTabEvent({
              tabId: v.tabId,
              chartId: v.rebuild.chart.chartId,
              chartType: v.rebuild.chart.chartType,
              title: v.title,
              modelId: v.modelId
            });

          this.sessionDrainService.enqueue({
            sessionId: v.sessionId,
            event: tabEvent
          });
        }

        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendProduceExplorerChartOutput =>
          v.rebuild.ok === false
            ? { status: 'error', errors: v.rebuild.errors }
            : {
                status: 'ok',
                tabId: v.tabId,
                chartId: v.rebuild.chart.chartId,
                title: v.title
              }
      )
    );
  }
}
