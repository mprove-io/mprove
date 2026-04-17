import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteProjectRequestDto,
  ToBackendDeleteProjectResponseDto
} from '#backend/controllers/projects/delete-project/delete-project.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type {
  ToDiskDeleteProjectRequest,
  ToDiskDeleteProjectResponse
} from '#common/zod/to-disk/02-projects/to-disk-delete-project';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteProjectController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteProject)
  @ApiOperation({
    summary: 'DeleteProject',
    description: 'Delete a project and all its related data'
  })
  @ApiOkResponse({
    type: ToBackendDeleteProjectResponseDto
  })
  async deleteProject(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteProjectRequestDto
  ) {
    let { projectId } = body.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      projectId: projectId,
      memberId: user.userId
    });

    let toDiskDeleteProjectRequest: ToDiskDeleteProjectRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskDeleteProject,
        traceId: body.info.traceId
      },
      payload: {
        orgId: project.orgId,
        projectId: projectId
      }
    };

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskDeleteProjectResponse>({
        orgId: project.orgId,
        projectId: projectId,
        repoId: null,
        message: toDiskDeleteProjectRequest,
        checkIsOk: true
      });

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(projectsTable)
            .where(eq(projectsTable.projectId, projectId));

          await tx
            .delete(membersTable)
            .where(eq(membersTable.projectId, projectId));

          await tx
            .delete(connectionsTable)
            .where(eq(connectionsTable.projectId, projectId));

          await tx.delete(envsTable).where(eq(envsTable.projectId, projectId));

          await tx
            .delete(branchesTable)
            .where(eq(branchesTable.projectId, projectId));

          await tx
            .delete(bridgesTable)
            .where(eq(bridgesTable.projectId, projectId));
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
