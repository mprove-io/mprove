import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendSetOrgOwnerRequestDto,
  ToBackendSetOrgOwnerResponseDto
} from '#backend/controllers/orgs/set-org-owner/set-org-owner.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { OrgTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  type UserEnt,
  usersTable
} from '#backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendNewOwnerNotFoundError } from '#common/types/backend/errors/backend-new-owner-not-found-error';
import type { GetDconfigHashSecretError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-error';
import type { GetOrgCheckExistsError } from '#common/types/backend/function-errors/get-org-check-exists-error';
import type { MakeHashError } from '#common/types/backend/function-errors/make-hash-error';
import type { UserEntToTabError } from '#common/types/backend/function-errors/user-ent-to-tab-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSetOrgOwnerOutput } from '#common/types/backend/routes/orgs/set-org-owner/set-org-owner-output';

@ApiTags('Orgs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetOrgOwnerController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    private orgsService: OrgsService,
    private dbService: DbService,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'org',
        (v): Result.ResultAsync<OrgTab, GetOrgCheckExistsError> =>
          this.orgsService.getOrgCheckExists({ orgId: v.orgId })
      ),
      Result.andThrough(v =>
        this.orgsService.checkUserIsOrgOwner({
          org: v.org,
          userId: v.userId
        })
      ),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretError> =>
          this.dconfigsService.getDconfigHashSecret()
      ),
      Result.bind(
        'ownerEmailHash',
        (v): Result.Result<string, MakeHashError> =>
          this.hashService.makeHash({
            input: v.ownerEmail,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'newOwner',
        (
          v
        ): Result.ResultAsync<
          UserTab,
          BackendNewOwnerNotFoundError | UserEntToTabError
        > =>
          this.db.drizzle.query.usersTable
            .findFirst({
              where: and(
                eq(usersTable.emailHash, v.ownerEmailHash),
                eq(usersTable.isEmailVerified, true)
              )
            })
            .then((x: UserEnt) =>
              isUndefined(x)
                ? Result.fail({ code: 'BACKEND_NEW_OWNER_NOT_FOUND' })
                : this.tabService.userEntToTab({ userEnt: x })
            )
      ),
      Result.map(v => {
        v.org.ownerId = v.newOwner.userId;
        v.org.ownerEmail = v.newOwner.email;

        return v;
      }),
      Result.andThrough(v =>
        this.dbService.write({
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
