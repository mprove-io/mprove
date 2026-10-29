import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCreateOrgRequestDto,
  ToBackendCreateOrgResponseDto
} from '#backend/controllers/orgs/create-org/create-org.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { orgsTable } from '#backend/drizzle/postgres/tables/orgs';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { addOrg } from '#backend/functions/db/orgs/add-org/add-org';
import { orgTabToApi } from '#backend/functions/db/orgs/org-tab-to-api/org-tab-to-api';
import { checkUserIsNotRestricted } from '#backend/functions/db/users/check-user-is-not-restricted/check-user-is-not-restricted';
import { makeHash } from '#backend/functions/hash/make-hash/make-hash';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
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
    private cs: ConfigService<BackendConfig>,
    private db: DbService,
    private rpcService: RpcService
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
        checkUserIsNotRestricted({
          user: v.user
        })
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
      Result.bind('hashSecret', v => getDconfigHashSecret({ db: this.db })),
      Result.bind('nameHash', v =>
        makeHash({
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
        addOrg({
          name: v.name,
          ownerId: v.user.userId,
          ownerEmail: v.user.email,
          traceId: v.traceId,
          rpcService: this.rpcService,
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendCreateOrgOutput => ({
          org: orgTabToApi({
            org: v.org
          })
        })
      )
    );
  }
}
