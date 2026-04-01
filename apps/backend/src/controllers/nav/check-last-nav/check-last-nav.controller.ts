import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { dashboardsTable } from '#backend/drizzle/postgres/schema/dashboards';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendCheckLastNavRequest,
  ToBackendCheckLastNavResponsePayload
} from '#common/interfaces/to-backend/nav/to-backend-check-last-nav';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class CheckLastNavController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCheckLastNav)
  async checkLastNav(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCheckLastNavRequest = request.body;

    let {
      projectId,
      repoId,
      branchId,
      envId,
      modelId,
      chartId,
      dashboardId,
      reportId
    } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let modelExists = false;
    let chartExists = false;
    let dashboardExists = false;
    let reportExists = false;

    if (isDefined(modelId)) {
      let model = await this.db.drizzle.query.modelsTable.findFirst({
        where: and(
          eq(modelsTable.structId, bridge.structId),
          eq(modelsTable.modelId, modelId)
        ),
        columns: { modelId: true }
      });
      modelExists = isDefined(model);
    }

    if (isDefined(chartId)) {
      let chart = await this.db.drizzle.query.chartsTable.findFirst({
        where: and(
          eq(chartsTable.structId, bridge.structId),
          eq(chartsTable.chartId, chartId)
        ),
        columns: { chartId: true }
      });
      chartExists = isDefined(chart);
    }

    if (isDefined(dashboardId)) {
      let dashboard = await this.db.drizzle.query.dashboardsTable.findFirst({
        where: and(
          eq(dashboardsTable.structId, bridge.structId),
          eq(dashboardsTable.dashboardId, dashboardId)
        ),
        columns: { dashboardId: true }
      });
      dashboardExists = isDefined(dashboard);
    }

    if (isDefined(reportId)) {
      let report = await this.db.drizzle.query.reportsTable.findFirst({
        where: and(
          eq(reportsTable.structId, bridge.structId),
          eq(reportsTable.reportId, reportId)
        ),
        columns: { reportId: true }
      });
      reportExists = isDefined(report);
    }

    let payload: ToBackendCheckLastNavResponsePayload = {
      modelExists: modelExists,
      chartExists: chartExists,
      dashboardExists: dashboardExists,
      reportExists: reportExists
    };

    return payload;
  }
}
