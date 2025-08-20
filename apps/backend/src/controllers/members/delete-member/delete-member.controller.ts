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
import { membersTable } from '~backend/drizzle/postgres/schema/members';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteMemberController {
  constructor(
    private rabbitService: RabbitService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteMember)
  async deleteMember(@AttachUser() user: UserEnt, @Req() request: any) {
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

    let toDiskDeleteDevRepoRequest: ToDiskDeleteDevRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId,
        devRepoId: devRepoId
      }
    };

    await this.rabbitService.sendToDisk<ToDiskDeleteDevRepoResponse>({
      routingKey: makeRoutingKeyToDisk({
        orgId: project.orgId,
        projectId: projectId
      }),
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
