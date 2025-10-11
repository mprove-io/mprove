import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
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

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CommitRepoController {
  constructor(
    private wrapToApiService: WrapEnxToApiService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private cs: ConfigService<BackendConfig>,
    private branchesService: BranchesService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCommitRepo)
  async commitRepo(@AttachUser() user: UserTab, @Req() request: any) {
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

    let baseProject = this.projectsService.tabToBaseProject({
      project: project
    });

    let toDiskCommitRepoRequest: ToDiskCommitRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCommitRepo,
        traceId: reqValid.info.traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: apiProject,
        repoId: repoId,
        branch: branchId,
        userAlias: user.alias,
        commitMessage: commitMessage
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
