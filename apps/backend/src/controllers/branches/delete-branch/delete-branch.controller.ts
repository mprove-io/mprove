import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteBranchController {
  constructor(
    private projectsService: ProjectsService,
    private rabbitService: RabbitService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteBranch)
  async deleteBranch(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendDeleteBranchRequest = request.body;

    let { projectId, isRepoProd, branchId } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditor({
      memberId: user.userId,
      projectId: projectId
    });

    if (branchId === project.defaultBranch) {
      throw new ServerError({
        message: ErEnum.BACKEND_DEFAULT_BRANCH_CANNOT_BE_DELETED
      });
    }

    let firstProjectId =
      this.cs.get<BackendConfig['firstProjectId']>('firstProjectId');

    if (
      member.isAdmin === false &&
      projectId === firstProjectId &&
      repoId === PROD_REPO_ID
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let toDiskDeleteBranchRequest: ToDiskDeleteBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        defaultBranch: project.defaultBranch,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskDeleteBranchResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskDeleteBranchRequest,
        checkIsOk: true
      });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(branchesTable)
            .where(
              and(
                eq(branchesTable.projectId, projectId),
                eq(branchesTable.repoId, repoId),
                eq(branchesTable.branchId, branchId)
              )
            );

          await tx
            .delete(bridgesTable)
            .where(
              and(
                eq(bridgesTable.projectId, projectId),
                eq(bridgesTable.repoId, repoId),
                eq(bridgesTable.branchId, branchId)
              )
            );
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
