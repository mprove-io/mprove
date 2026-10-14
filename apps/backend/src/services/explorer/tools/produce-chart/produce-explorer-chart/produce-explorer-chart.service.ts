import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import {
  ExplorerChartRebuildService,
  type ExplorerRebuildOk,
  type ExplorerRebuildResult
} from '#backend/services/explorer/explorer-chart-rebuild/explorer-chart-rebuild.service';
import { ExplorerEventsMakerService } from '#backend/services/explorer/explorer-events-maker/explorer-events-maker.service';
import { SessionDrainService } from '#backend/services/session/session-drain/session-drain.service';
import { makeId } from '#common/functions/make-id/make-id';
import type { BackendSessionTypeIsNotExplorerError } from '#common/types/backend/errors/backend-session-type-is-not-explorer-error';
import type { BackendUnauthorizedError } from '#common/types/backend/errors/backend-unauthorized-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { ProduceExplorerChartError } from '#common/types/backend/function-errors/produce-explorer-chart-error';
import type { RebuildFromYamlError } from '#common/types/backend/function-errors/rebuild-from-yaml-error';
import type { SessionTabCreatedEvent } from '#common/types/backend/parts/session/session-tab-created-event';
import type { ToBackendProduceExplorerChartOutput } from '#common/types/backend/routes/charts/produce-explorer-chart/produce-explorer-chart-output';

export const CHART_ID_PLACEHOLDER = '<chart-id-placeholder>';

@Injectable()
export class ProduceExplorerChartService {
  constructor(
    private sessionsService: SessionsService,
    private explorerChartRebuildService: ExplorerChartRebuildService,
    private explorerEventsMakerService: ExplorerEventsMakerService,
    private sessionDrainService: SessionDrainService,
    private runQueriesService: RunQueriesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async produceExplorerChartResult(item: {
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
      Result.bind(
        'preparedChartYaml',
        (v): Result.Result<string, never> =>
          Result.succeed(
            v.chartYaml.split(CHART_ID_PLACEHOLDER).join(v.chartId)
          )
      ),
      Result.bind(
        'session',
        (v): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsError> =>
          this.sessionsService.getSessionByIdCheckExistsResult({
            sessionId: v.sessionId
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
      Result.bind(
        'rebuild',
        (v): Result.ResultAsync<ExplorerRebuildResult, RebuildFromYamlError> =>
          this.explorerChartRebuildService.rebuildFromYamlResult({
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

        return dbErrorToResult({
          action: async () => {
            // Keep rejection inside the full transaction/retry boundary.
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insert: {
                        charts: [rebuild.chart],
                        mconfigs: [rebuild.mconfig]
                      },
                      insertOrDoNothing: { queries: [rebuild.query] }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        });
      }),
      Result.andThrough(async v =>
        v.rebuild.ok === false
          ? Result.succeed()
          : this.runQueriesService.runQueriesResult({
              user: v.user,
              projectId: v.session.projectId,
              repoId: v.session.repoId,
              branchId: v.session.branchId,
              envId: v.session.envId,
              mconfigIds: [v.rebuild.mconfig.mconfigId]
            })
      ),
      Result.bind(
        'tabId',
        (v): Result.Result<string, never> =>
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
