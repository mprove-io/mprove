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
  ToBackendCreateRoleGivenRequestDto,
  ToBackendCreateRoleGivenResponseDto
} from '#backend/controllers/roles/create-role-given/create-role-given.dto';
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
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendCreateRoleGivenOutput } from '#common/zod/backend/routes/roles/create-role-given/create-role-given-response';

@ApiTags('Roles')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateRoleGivenController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private givensService: GivensService,
    private rolesService: RolesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCreateRoleGiven' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateRoleGiven',
    description: 'Create a project role given'
  })
  @ApiOkResponse({
    type: ToBackendCreateRoleGivenResponseDto
  })
  async createRoleGiven(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateRoleGivenRequestDto
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

    let given = await this.givensService.getGivenCheckExists({
      projectId: projectId,
      givenId: givenId
    });

    this.givensService.validateGivenValues({
      type: given.type,
      isMultiple: given.isMultiple === true,
      values: values
    });

    this.rolesService.checkRoleGivenDoesNotExist({
      role: role,
      givenId: givenId
    });

    role.gvs.push({
      givenId: givenId,
      values: values
    });

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

    let payload: ToBackendCreateRoleGivenOutput = {
      userMember: this.membersService.tabToApi({ member: userMember }),
      roles: apiRoles
    };

    return payload;
  }
}
