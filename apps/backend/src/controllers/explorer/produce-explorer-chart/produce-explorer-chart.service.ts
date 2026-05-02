import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { SessionsService } from '#backend/services/db/sessions.service';
import { ExplorerChartRebuildService } from '#backend/services/explorer/explorer-chart-rebuild.service';
import { ExplorerEventsMakerService } from '#backend/services/explorer/explorer-events-maker.service';
import { SessionDrainService } from '#backend/services/session/session-drain.service';
import { ErEnum } from '#common/enums/er.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { makeId } from '#common/functions/make-id';
import { ServerError } from '#common/models/server-error';
import type { ToBackendProduceExplorerChartResponsePayload } from '#common/zod/to-backend/explorer/to-backend-produce-explorer-chart';

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

  async produceExplorerChart(item: {
    user: UserTab;
    traceId: string;
    sessionId: string;
    chartId: string;
    modelId: string;
    chartYaml: string;
    title: string;
  }): Promise<ToBackendProduceExplorerChartResponsePayload> {
    let { user, traceId, sessionId, chartId, modelId, chartYaml, title } = item;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({ message: ErEnum.BACKEND_UNAUTHORIZED });
    }

    if (session.type !== SessionTypeEnum.Explorer) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_TYPE_IS_NOT_EXPLORER
      });
    }

    let rebuildResult = await this.explorerChartRebuildService.rebuildFromYaml({
      traceId: traceId,
      session: session,
      chartId: chartId,
      modelId: modelId,
      chartYaml: chartYaml
    });

    if (rebuildResult.ok === false) {
      return { status: 'error', errors: rebuildResult.errors };
    }

    let { chart, mconfig, query } = rebuildResult;

    chart.title = title;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                charts: [chart],
                mconfigs: [mconfig]
              },
              insertOrDoNothing: {
                queries: [query]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    await this.runQueriesService.runQueries({
      user: user,
      projectId: session.projectId,
      repoId: session.repoId,
      branchId: session.branchId,
      envId: session.envId,
      mconfigIds: [mconfig.mconfigId]
    });

    let tabId = makeId();

    let tabEvent = this.explorerEventsMakerService.makeChartTabEvent({
      tabId: tabId,
      chartId: chart.chartId,
      chartType: chart.chartType,
      title: title,
      modelId: modelId
    });

    this.sessionDrainService.enqueue({
      sessionId: sessionId,
      event: tabEvent
    });

    let payload: ToBackendProduceExplorerChartResponsePayload = {
      status: 'ok',
      tabId: tabId,
      chartId: chart.chartId,
      title: title
    };

    return payload;
  }
}
