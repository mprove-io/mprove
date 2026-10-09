import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
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
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { OrgTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { type OrgEnt, orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { DEMO_ORG_NAME } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import { isDefined } from '#common/functions/is-defined/is-defined';
import type { AddOrgResultError } from '#common/types/backend/function-errors/add-org-result-error';
import type { GetDconfigHashSecretResultError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';
import type { MakeHashResultError } from '#common/types/backend/function-errors/make-hash-result-error';
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
    @Inject(DRIZZLE) private db: Db
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
        user: user,
        usersService: this.usersService,
        dconfigsService: this.dconfigsService,
        hashService: this.hashService,
        orgsService: this.orgsService,
        cs: this.cs,
        db: this.db
      }),
      Result.andThrough(v =>
        v.usersService.checkUserIsNotRestrictedResult({ user: v.user })
      ),
      Result.andThrough(v => {
        let allowUsersToCreateOrganizations: boolean = v.cs.get<
          BackendConfig['allowUsersToCreateOrganizations']
        >('allowUsersToCreateOrganizations');

        let mproveAdminEmail: string =
          v.cs.get<BackendConfig['mproveAdminEmail']>('mproveAdminEmail');

        return allowUsersToCreateOrganizations === false &&
          v.user.email !== mproveAdminEmail
          ? Result.fail({
              code: 'BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN'
            })
          : Result.succeed();
      }),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretResultError> =>
          v.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.bind(
        'nameHash',
        (v): Result.Result<string, MakeHashResultError> =>
          v.hashService.makeHashResult({
            input: v.name,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'orgEnt',
        (v): Result.ResultAsync<OrgEnt, never> =>
          v.db.drizzle.query.orgsTable
            .findFirst({
              where: eq(orgsTable.nameHash, v.nameHash)
            })
            .then(orgEnt => Result.succeed(orgEnt))
      ),
      Result.andThrough(v =>
        v.name.toLowerCase() === DEMO_ORG_NAME.toLowerCase()
          ? Result.fail({ code: 'BACKEND_RESTRICTED_ORGANIZATION_NAME' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isDefined(v.orgEnt)
          ? Result.fail({ code: 'BACKEND_ORG_ALREADY_EXISTS' })
          : Result.succeed()
      ),
      Result.bind(
        'org',
        (v): Result.ResultAsync<OrgTab, AddOrgResultError> =>
          v.orgsService.addOrgResult({
            name: v.name,
            ownerId: v.user.userId,
            ownerEmail: v.user.email,
            traceId: v.traceId
          })
      ),
      Result.map(
        (v): ToBackendCreateOrgOutput => ({
          org: v.orgsService.tabToApi({ org: v.org })
        })
      )
    );
  }
}
