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
  ToBackendDeleteRoleGivenRequestDto,
  ToBackendDeleteRoleGivenResponseDto
} from '#backend/controllers/roles/delete-role-given/delete-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { RolesService } from '#backend/services/db/roles.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteRoleGivenOutput } from '#common/types/backend/routes/roles/delete-role-given/delete-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteRoleGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteRoleGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteRoleGiven',
    description: 'Delete a project role given'
  })
  @ApiOkResponse({
    type: ToBackendDeleteRoleGivenResponseDto
  })
  async deleteRoleGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteRoleGivenRequestDto
  ) {
    let { projectId, roleId, givenId } = body.input;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let role = await this.rolesService.getRoleCheckExists({
      projectId: projectId,
      roleId: roleId
    });

    role.gvs = role.gvs.filter(x => x.givenId !== givenId);

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                roles: [role]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let apiRoles = await this.rolesService.getApiRoles({
      projectId: projectId
    });

    let payload: ToBackendDeleteRoleGivenOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      roles: apiRoles
    };

    return payload;
  }
}
