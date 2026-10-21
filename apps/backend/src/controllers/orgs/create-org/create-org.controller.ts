import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateOrgRequestDto,
  ToBackendCreateOrgResponseDto
} from '#backend/controllers/orgs/create-org/create-org.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { DEMO_ORG_NAME } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateOrgOutput } from '#common/types/backend/routes/orgs/create-org/create-org-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateOrgController {
  constructor(
    private tabService: TabService,
    private usersService: UsersService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private orgsService: OrgsService,
    private cs: ConfigService<BackendConfig>,
    private db: DbService
  ) {}

  @Post('api/ToBackendCreateOrg' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateOrg',
    description: 'Create a new organization owned by the current user'
  })
  @ApiOkResponse({
    type: ToBackendCreateOrgResponseDto
  })
  async createOrg(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateOrgRequestDto
  ): Promise<BackendResultForOperation<'createOrg'>> {
    return Result.pipe(
      Result.succeed({
        name: body.input.name,
        traceId: body.traceId,
        user: user
      }),
      Result.andThrough(v =>
        this.usersService.checkUserIsNotRestricted({ user: v.user })
      ),
      Result.andThrough(v => {
        let allowUsersToCreateOrganizations: boolean = this.cs.get<
          BackendConfig['allowUsersToCreateOrganizations']
        >('allowUsersToCreateOrganizations');

        let mproveAdminEmail: string =
          this.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail');

        return allowUsersToCreateOrganizations === false &&
          v.user.email !== mproveAdminEmail
          ? Result.fail({
              code: 'BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN'
            })
          : Result.succeed();
      }),
      Result.bind('hashSecret', v =>
        this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind('nameHash', v =>
        this.hashService.makeHash({
          input: v.name,
          hashSecret: v.hashSecret
        })
      ),
      Result.bind('isOrgExist', v =>
        this.db.orgs.isExist({
          where: eq(orgsTable.nameHash, v.nameHash)
        })
      ),
      Result.andThrough(v =>
        v.name.toLowerCase() === DEMO_ORG_NAME.toLowerCase()
          ? Result.fail({ code: 'BACKEND_RESTRICTED_ORGANIZATION_NAME' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.isOrgExist
          ? Result.fail({ code: 'BACKEND_ORG_ALREADY_EXISTS' })
          : Result.succeed()
      ),
      Result.bind('org', v =>
        this.orgsService.addOrg({
          name: v.name,
          ownerId: v.user.userId,
          ownerEmail: v.user.email,
          traceId: v.traceId
        })
      ),
      Result.map(
        (v): ToBackendCreateOrgOutput => ({
          org: this.orgsService.tabToApi({ org: v.org })
        })
      )
    );
  }
}
