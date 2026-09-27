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
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateRoleRequestDto,
  ToBackendCreateRoleResponseDto
} from '#backend/controllers/roles/create-role/create-role.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { RolesService } from '#backend/services/db/roles.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendCreateRoleOutput } from '#common/zod/backend/routes/roles/create-role/create-role-response';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateRoleController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCreateRole' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateRole',
    description: 'Create a project role'
  })
  @ApiOkResponse({
    type: ToBackendCreateRoleResponseDto
  })
  async createRole(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateRoleRequestDto
  ) {
    let { projectId, roleId } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    await this.rolesService.checkRoleDoesNotExist({
      projectId: projectId,
      roleId: roleId
    });

    let newRole = this.rolesService.makeRole({
      projectId: projectId,
      roleId: roleId,
      gvs: []
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                roles: [newRole]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let apiRoles = await this.rolesService.getApiRoles({
      projectId: projectId
    });

    let payload: ToBackendCreateRoleOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      roles: apiRoles
    };

    return payload;
  }
}
