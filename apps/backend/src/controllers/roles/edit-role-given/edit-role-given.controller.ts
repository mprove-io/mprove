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
  ToBackendEditRoleGivenRequestDto,
  ToBackendEditRoleGivenResponseDto
} from '#backend/controllers/roles/edit-role-given/edit-role-given.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { GivensService } from '#backend/services/db/givens.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { RolesService } from '#backend/services/db/roles.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditRoleGivenOutput } from '#common/types/backend/routes/roles/edit-role-given/edit-role-given-output';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditRoleGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendEditRoleGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditRoleGiven',
    description: 'Edit a project role given'
  })
  @ApiOkResponse({
    type: ToBackendEditRoleGivenResponseDto
  })
  async editRoleGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditRoleGivenRequestDto
  ) {
    let { projectId, roleId, givenId, values } = body.input;

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

    let roleGiven = this.rolesService.getRoleGivenCheckExists({
      role: role,
      givenId: givenId
    });

    let given = await this.givensService.getGivenCheckExists({
      projectId: projectId,
      givenId: givenId
    });

    this.givensService.validateGivenValues({
      type: given.type,
      isMultiple: given.isMultiple === true,
      values: values
    });

    roleGiven.values = values;

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

    let payload: ToBackendEditRoleGivenOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      roles: apiRoles
    };

    return payload;
  }
}
