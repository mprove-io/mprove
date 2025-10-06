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
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { ToBackendDeleteBranchRequest } from '~common/interfaces/to-backend/branches/to-backend-delete-branch';
import {
  ToDiskDeleteBranchRequest,
  ToDiskDeleteBranchResponse
} from '~common/interfaces/to-disk/05-branches/to-disk-delete-branch';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteBranchController {
  constructor(
    private wrapToApiService: WrapToApiService,
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

    let demoProjectId =
      this.cs.get<BackendConfig['demoProjectId']>('demoProjectId');

    if (
      member.isAdmin === false &&
      projectId === demoProjectId &&
      repoId === PROD_REPO_ID
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

    let apiProject = this.wrapToApiService.wrapToApiProject({
      project: project,
      isAddGitUrl: true,
      isAddPrivateKey: true,
      isAddPublicKey: true
    });

    let toDiskDeleteBranchRequest: ToDiskDeleteBranchRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteBranch,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: apiProject,
        repoId: repoId,
        branch: branchId
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
