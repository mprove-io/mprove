import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import retry from 'async-retry';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  MemberTab,
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { MembersService } from '#backend/services/db/members.service';
import { ModelsService } from '#backend/services/db/models.service';
import { ReportsService } from '#backend/services/db/reports.service';
import { StructsService } from '#backend/services/db/structs.service';
import { ReportDataService } from '#backend/services/report-data.service';
import { TabService } from '#backend/services/tab.service';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { makeCopy } from '#common/functions/make-copy';
import type { ToBackendGetReportResponsePayload } from '#common/interfaces/to-backend/reports/to-backend-get-report';

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
    timeSpec: TimeSpecEnum;
    timeRangeFractionBrick: string;
    skipUi: boolean;
  }): Promise<ToBackendGetReportResponsePayload> {
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

    let payload: ToBackendGetReportResponsePayload = {
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
