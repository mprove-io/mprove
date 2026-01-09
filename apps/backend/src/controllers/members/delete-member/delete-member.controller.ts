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
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '~backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '~backend/drizzle/postgres/schema/bridges';
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { RpcService } from '~backend/services/rpc.service';
import { TabService } from '~backend/services/tab.service';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { ToBackendDeleteMemberRequest } from '~common/interfaces/to-backend/members/to-backend-delete-member';
import {
  ToDiskDeleteDevRepoRequest,
  ToDiskDeleteDevRepoResponse
} from '~common/interfaces/to-disk/03-repos/to-disk-delete-dev-repo';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteMemberController {
  constructor(
    private tabService: TabService,
    private rpcService: RpcService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteMember)
  async deleteMember(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteMemberRequest = request.body;

    let { traceId } = reqValid.info;
    let { projectId, memberId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    if (user.userId === memberId) {
      throw new ServerError({
        message: ErEnum.BACKEND_ADMIN_CANNOT_DELETE_HIMSELF
      });
    }

    let member = await this.membersService.getMemberCheckExists({
      memberId: memberId,
      projectId: projectId
    });

    let devRepoId = member.memberId;

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskDeleteDevRepoRequest: ToDiskDeleteDevRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        baseProject: baseProject,
        devRepoId: devRepoId
      }
    };

    await this.rpcService.sendToDisk<ToDiskDeleteDevRepoResponse>({
      orgId: project.orgId,
      projectId: projectId,
      repoId: devRepoId,
      message: toDiskDeleteDevRepoRequest,
      checkIsOk: true
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(membersTable)
            .where(
              and(
                eq(membersTable.projectId, projectId),
                eq(membersTable.memberId, memberId)
              )
            );

          await tx
            .delete(branchesTable)
            .where(
              and(
                eq(branchesTable.projectId, projectId),
                eq(branchesTable.repoId, devRepoId)
              )
            );

          await tx
            .delete(bridgesTable)
            .where(
              and(
                eq(bridgesTable.projectId, projectId),
                eq(bridgesTable.repoId, devRepoId)
              )
            );
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
