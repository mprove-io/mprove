import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, inArray } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteDraftReportsController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private branchesService: BranchesService,
    private envsService: EnvsService,
    private bridgesService: BridgesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReports)
  async deleteDraftReports(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendDeleteDraftReportsRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, isRepoProd, branchId, envId, reportIds } =
      reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

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
