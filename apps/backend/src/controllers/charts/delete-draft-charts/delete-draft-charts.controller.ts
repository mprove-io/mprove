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
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { UsersService } from '#backend/services/db/users.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendDeleteDraftChartsRequest } from '#common/interfaces/to-backend/charts/to-backend-delete-draft-charts';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteDraftChartsController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private branchesService: BranchesService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteDraftCharts)
  async deleteDraftCharts(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteDraftChartsRequest = request.body;

    this.usersService.checkUserIsNotRestricted({ user: user });

    let { traceId } = reqValid.info;
    let { projectId, repoId, branchId, envId, chartIds } = reqValid.payload;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: user.userId,
      projectId: projectId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    if (userMember.isExplorer === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_MEMBER_IS_NOT_EXPLORER
      });
    }

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

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(chartsTable)
            .where(
              and(
                inArray(chartsTable.chartId, chartIds),
                eq(chartsTable.draft, true),
                eq(chartsTable.creatorId, user.userId),
                eq(chartsTable.structId, bridge.structId)
              )
            );
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
