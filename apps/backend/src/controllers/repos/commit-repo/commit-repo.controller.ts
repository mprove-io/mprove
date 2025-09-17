import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import {
  ToBackendCommitRepoRequest,
  ToBackendCommitRepoResponsePayload
} from '~common/interfaces/to-backend/repos/to-backend-commit-repo';
import {
  ToDiskCommitRepoRequest,
  ToDiskCommitRepoResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-commit-repo';
import { ServerError } from '~common/models/server-error';

@UseGuards(ValidateRequestGuard)
@Controller()
export class CommitRepoController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private cs: ConfigService<BackendConfig>,
    private branchesService: BranchesService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCommitRepo)
  async commitRepo(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendCommitRepoRequest = request.body;

    let { projectId, branchId, isRepoProd, commitMessage } = reqValid.payload;

    if (isRepoProd === true) {
      throw new ServerError({
        message: ErEnum.BACKEND_MANUAL_COMMIT_TO_PRODUCTION_REPO_IS_FORBIDDEN
      });
    }

    let repoId =
      // isRepoProd === true ? PROD_REPO_ID :
      user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditor({
      projectId: projectId,
      memberId: user.userId
    });

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

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let toDiskCommitRepoRequest: ToDiskCommitRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        commitMessage: commitMessage,
        remoteType: project.remoteType,
        gitUrl: project.gitUrl,
        privateKey: project.privateKey,
        publicKey: project.publicKey
      }
    };

    let diskResponse =
      await this.rabbitService.sendToDisk<ToDiskCommitRepoResponse>({
        routingKey: makeRoutingKeyToDisk({
          orgId: project.orgId,
          projectId: projectId
        }),
        message: toDiskCommitRepoRequest,
        checkIsOk: true
      });

    let payload: ToBackendCommitRepoResponsePayload = {
      repo: diskResponse.payload.repo
    };

    return payload;
  }
}
