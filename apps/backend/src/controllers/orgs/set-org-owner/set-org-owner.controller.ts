import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendSetOrgOwnerRequestDto,
  ToBackendSetOrgOwnerResponseDto
} from '#backend/controllers/orgs/set-org-owner/set-org-owner.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import { usersTable } from '#backend/drizzle/postgres/schema/users';
import { getDconfigHashSecret } from '#backend/functions/db/dconfigs/get-dconfig-hash-secret/get-dconfig-hash-secret';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { HashService } from '#backend/services/hash/hash.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { BackendNewOwnerNotFoundError } from '#common/types/backend/errors/backend-new-owner-not-found-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetOrgOwnerOutput } from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetOrgOwnerController {
  constructor(
    private hashService: HashService,
    private orgsService: OrgsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendSetOrgOwner' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SetOrgOwner',
    description: 'Transfer organization ownership to another verified user'
  })
  @ApiOkResponse({
    type: ToBackendSetOrgOwnerResponseDto
  })
  async setOrgOwner(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSetOrgOwnerRequestDto
  ): Promise<BackendResultForOperation<'setOrgOwner'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        ownerEmail: body.input.ownerEmail,
        userId: user.userId
      }),
      Result.bind('org', v =>
        this.db.orgs.findFirstCheckExists({
          where: eq(orgsTable.orgId, v.orgId)
        })
      ),
      Result.andThrough(v =>
        this.orgsService.checkUserIsOrgOwner({
          org: v.org,
          userId: v.userId
        })
      ),
      Result.bind('hashSecret', v => getDconfigHashSecret({ db: this.db })),
      Result.bind('ownerEmailHash', v =>
        this.hashService.makeHash({
          input: v.ownerEmail,
          hashSecret: v.hashSecret
        })
      ),
      Result.bind('newOwner', v =>
        this.db.users.findFirstCheckExists({
          where: and(
            eq(usersTable.emailHash, v.ownerEmailHash),
            eq(usersTable.isEmailVerified, true)
          )
        })
      ),
      Result.mapError(v =>
        v.code === 'BACKEND_USER_DOES_NOT_EXIST'
          ? ({
              code: 'BACKEND_NEW_OWNER_NOT_FOUND'
            } satisfies BackendNewOwnerNotFoundError)
          : v
      ),
      Result.map(v => {
        v.org.ownerId = v.newOwner.userId;
        v.org.ownerEmail = v.newOwner.email;

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: { orgs: [v.org] }
        })
      ),
      Result.map(
        (v): ToBackendSetOrgOwnerOutput => ({
          org: this.orgsService.tabToApi({ org: v.org })
        })
      )
    );
  }
}
