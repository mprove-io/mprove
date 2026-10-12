import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  MemberTab,
  ProjectTab,
  ReportTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ReportDataService } from '#backend/services/report-data/report-data.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetModelPartXsError } from '#common/types/backend/function-errors/get-model-part-xs-error';
import type { GetReportCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';
import type { GetReportDataError } from '#common/types/backend/function-errors/get-report-data-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { QueryInfoReportGetReportDataError } from '#common/types/backend/function-errors/query-info-report-get-report-data-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelPartX } from '#common/types/backend/parts/model/model-part-x';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { ToBackendGetReportOutput } from '#common/types/backend/routes/reports/get-report/get-report-output';
import type { TimeSpec } from '#common/types/shared/time/timespec';

@Injectable()
export class QueryInfoReportService {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private reportsService: ReportsService,
    private reportDataService: ReportDataService,
    private structsService: StructsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getReportData(item: {
    traceId: string;
    user: UserTab;
    userMember: MemberTab;
    project: ProjectTab;
    bridge: BridgeTab;
    projectId: string;
    envId: string;
    reportId: string;
    timezone: string;
    timeSpec: TimeSpec;
    timeRangeFractionBrick: string;
    skipUi: boolean;
  }): Promise<ToBackendGetReportOutput> {
    let {
      traceId,
      user,
      userMember,
      project,
      bridge,
      projectId,
      envId,
      reportId,
      timezone,
      timeSpec,
      timeRangeFractionBrick,
      skipUi
    } = item;

    let result: Result.Result<
      ToBackendGetReportOutput,
      QueryInfoReportGetReportDataError
    > = await this.getReportDataResult({
      traceId: traceId,
      user: user,
      userMember: userMember,
      project: project,
      bridge: bridge,
      projectId: projectId,
      envId: envId,
      reportId: reportId,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      skipUi: skipUi
    });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          'displayData' in result.error ? result.error.displayData : undefined,
        customData: 'info' in result.error ? result.error.info : undefined
      });
    }

    let output: ToBackendGetReportOutput = result.value;

    return output;
  }

  async getReportDataResult(item: {
    traceId: string;
    user: UserTab;
    userMember: MemberTab;
    project: ProjectTab;
    bridge: BridgeTab;
    projectId: string;
    envId: string;
    reportId: string;
    timezone: string;
    timeSpec: TimeSpec;
    timeRangeFractionBrick: string;
    skipUi: boolean;
  }): Result.ResultAsync<
    ToBackendGetReportOutput,
    QueryInfoReportGetReportDataError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'report',
        (
          v
        ): Result.ResultAsync<ReportTab, GetReportCheckExistsAndAccessError> =>
          this.reportsService.getReportCheckExistsAndAccessResult({
            projectId: v.projectId,
            reportId: v.reportId,
            structId: v.bridge.structId,
            user: v.user,
            userMember: v.userMember
          })
      ),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'apiReport',
        (v): Result.ResultAsync<ReportX, GetReportDataError> =>
          this.reportDataService.getReportDataResult({
            report: v.report,
            traceId: v.traceId,
            project: v.project,
            apiUserMember: v.apiUserMember,
            userMember: v.userMember,
            user: v.user,
            envId: v.envId,
            struct: v.struct,
            metrics: v.struct.metrics,
            timeSpec: v.timeSpec,
            timeRangeFractionBrick: v.timeRangeFractionBrick,
            timezone: v.timezone
          })
      ),
      Result.andThrough(async v => {
        if (v.skipUi === false) {
          v.user.ui = v.user.ui || makeCopy(DEFAULT_SRV_UI);

          v.user.ui.timezone = v.timezone;

          v.user.ui.timeSpec = v.timeSpec;

          v.user.ui.timeRangeFraction = v.apiReport.timeRangeFraction;

          let persistenceResult: Result.Result<void, DbErrorToError> =
            await dbErrorToResult({
              action: async () => {
                await retry(
                  async () =>
                    await this.db.drizzle.transaction(
                      async tx =>
                        await this.db.packer.write({
                          tx: tx,
                          insertOrUpdate: {
                            users: [v.user]
                          }
                        })
                    ),
                  getRetryOption(this.cs, this.logger)
                );
              }
            });

          if (Result.isFailure(persistenceResult)) {
            return persistenceResult;
          }
        }

        return Result.succeed();
      }),
      Result.bind(
        'modelPartXs',
        (v): Result.ResultAsync<ModelPartX[], GetModelPartXsError> =>
          this.modelsService.getModelPartXsResult({
            structId: v.struct.structId,
            apiUserMember: v.apiUserMember
          })
      ),
      Result.map(
        (v): ToBackendGetReportOutput => ({
          needValidate: v.bridge.needValidate,
          struct: this.structsService.tabToApi({
            struct: v.struct,
            modelPartXs: v.modelPartXs
          }),
          userMember: v.apiUserMember,
          report: v.apiReport
        })
      )
    );
  }
}
