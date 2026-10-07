import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { ReportDataService } from '#backend/services/report-data/report-data.service';
import { TabService } from '#backend/services/tab/tab.service';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { makeCopy } from '#common/functions/make-copy/make-copy';
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

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let report = await this.reportsService.getReportCheckExistsAndAccess({
      projectId: projectId,
      reportId: reportId,
      structId: bridge.structId,
      user: user,
      userMember: userMember
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let apiReport = await this.reportDataService.getReportData({
      report: report,
      traceId: traceId,
      project: project,
      apiUserMember: apiUserMember,
      userMember: userMember,
      user: user,
      envId: envId,
      struct: struct,
      metrics: struct.metrics,
      timeSpec: timeSpec,
      timeRangeFractionBrick: timeRangeFractionBrick,
      timezone: timezone
    });

    if (skipUi === false) {
      user.ui = user.ui || makeCopy(DEFAULT_SRV_UI);
      user.ui.timezone = timezone;
      user.ui.timeSpec = timeSpec;
      user.ui.timeRangeFraction = apiReport.timeRangeFraction;

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  users: [user]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let modelPartXs = await this.modelsService.getModelPartXs({
      structId: struct.structId,
      apiUserMember: apiUserMember
    });

    let payload: ToBackendGetReportOutput = {
      needValidate: bridge.needValidate,
      struct: this.structsService.tabToApi({
        struct: struct,
        modelPartXs: modelPartXs
      }),
      userMember: apiUserMember,
      report: apiReport
    };

    return payload;
  }
}
