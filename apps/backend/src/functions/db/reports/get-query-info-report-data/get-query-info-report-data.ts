import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type pgPromise from 'pg-promise';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getModelPartXs } from '#backend/functions/db/models/get-model-part-xs/get-model-part-xs';
import { getReportCheckExistsAndAccess } from '#backend/functions/db/reports/get-report-check-exists-and-access/get-report-check-exists-and-access';
import { getReportData } from '#backend/functions/db/reports/get-report-data/get-report-data';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { structTabToApi } from '#backend/functions/db/structs/struct-tab-to-api/struct-tab-to-api';
import type { DbService } from '#backend/services/db/db.service';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { GetQueryInfoReportDataError } from '#common/types/backend/function-errors/get-query-info-report-data-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { ToBackendGetReportOutput } from '#common/types/backend/routes/reports/get-report/get-report-output';
import type { TimeSpec } from '#common/types/shared/time/timespec';

export async function getQueryInfoReportData(item: {
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
  db: DbService;
  cs: ConfigService<BackendConfig>;
  calcDb: pgPromise.IDatabase<unknown>;
  logger: Logger;
}): Result.ResultAsync<ToBackendGetReportOutput, GetQueryInfoReportDataError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('struct', v =>
      getStructCheckExists({
        structId: v.bridge.structId,
        projectId: v.projectId,
        cs: v.cs,
        db: v.db
      })
    ),
    Result.bind('report', v =>
      getReportCheckExistsAndAccess({
        projectId: v.projectId,
        reportId: v.reportId,
        structId: v.bridge.structId,
        user: v.user,
        userMember: v.userMember,
        db: v.db
      })
    ),
    Result.bind('apiUserMember', v =>
      Result.succeed(
        memberTabToApi({
          member: v.userMember
        })
      )
    ),
    Result.bind('apiReport', v =>
      getReportData({
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
        timezone: v.timezone,
        db: v.db,
        calcDb: v.calcDb,
        logger: v.logger,
        cs: v.cs
      })
    ),
    Result.andThrough(async v => {
      if (v.skipUi === false) {
        v.user.ui = v.user.ui || makeCopy(DEFAULT_SRV_UI);

        v.user.ui.timezone = v.timezone;

        v.user.ui.timeSpec = v.timeSpec;

        v.user.ui.timeRangeFraction = v.apiReport.timeRangeFraction;

        let persistenceResult: Result.Result<void, WriteError> =
          await v.db.write({
            insertOrUpdate: {
              users: [v.user]
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }
      }

      return Result.succeed();
    }),
    Result.bind('modelPartXs', v =>
      getModelPartXs({
        structId: v.struct.structId,
        apiUserMember: v.apiUserMember,
        db: v.db
      })
    ),
    Result.map(
      (v): ToBackendGetReportOutput => ({
        needValidate: v.bridge.needValidate,
        struct: structTabToApi({
          struct: v.struct,
          modelPartXs: v.modelPartXs
        }),
        userMember: v.apiUserMember,
        report: v.apiReport
      })
    )
  );
}
