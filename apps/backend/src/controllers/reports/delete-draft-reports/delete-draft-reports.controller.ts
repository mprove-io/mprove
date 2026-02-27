import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq, inArray } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendDeleteDraftReportsRequest } from '#common/interfaces/to-backend/reports/to-backend-delete-draft-reports';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteDraftReportsController {
  constructor(
    private tabService: TabService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReports)
  async deleteDraftReports(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteDraftReportsRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, envId, reportIds } = reqValid.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(reportsTable)
            .where(
              and(
                inArray(reportsTable.reportId, reportIds),
                eq(reportsTable.projectId, projectId),
                eq(reportsTable.draft, true),
                eq(reportsTable.creatorId, user.userId),
                eq(reportsTable.structId, bridge.structId)
              )
            );
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
