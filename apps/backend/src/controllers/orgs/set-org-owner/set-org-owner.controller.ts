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
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
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
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendNewOwnerNotFoundError } from '#common/types/backend/errors/backend-new-owner-not-found-error';
import type { GetDconfigHashSecretResultError } from '#common/types/backend/function-errors/get-dconfig-hash-secret-result-error';
import type { GetOrgCheckExistsResultError } from '#common/types/backend/function-errors/get-org-check-exists-result-error';
import type { MakeHashResultError } from '#common/types/backend/function-errors/make-hash-result-error';
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
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
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
        userId: user.userId,
        orgsService: this.orgsService,
        dconfigsService: this.dconfigsService,
        hashService: this.hashService,
        tabService: this.tabService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.bind(
        'org',
        (v): Result.ResultAsync<OrgTab, GetOrgCheckExistsResultError> =>
          v.orgsService.getOrgCheckExistsResult({ orgId: v.orgId })
      ),
      Result.andThrough(v =>
        v.orgsService.checkUserIsOrgOwnerResult({
          org: v.org,
          userId: v.userId
        })
      ),
      Result.bind(
        'hashSecret',
        (v): Result.ResultAsync<string, GetDconfigHashSecretResultError> =>
          v.dconfigsService.getDconfigHashSecretResult()
      ),
      Result.bind(
        'ownerEmailHash',
        (v): Result.Result<string, MakeHashResultError> =>
          v.hashService.makeHashResult({
            input: v.ownerEmail,
            hashSecret: v.hashSecret
          })
      ),
      Result.bind(
        'newOwner',
        (v): Result.ResultAsync<UserTab, BackendNewOwnerNotFoundError> =>
          v.db.drizzle.query.usersTable
            .findFirst({
              where: and(
                eq(usersTable.emailHash, v.ownerEmailHash),
                eq(usersTable.isEmailVerified, true)
              )
            })
            .then((newOwnerEnt: UserEnt) => {
              if (isUndefined(newOwnerEnt)) {
                return Result.fail({ code: 'BACKEND_NEW_OWNER_NOT_FOUND' });
              }

              let newOwner: UserTab = v.tabService.userEntToTab(newOwnerEnt);

              return Result.succeed(newOwner);
            })
      ),
      Result.inspect(v => {
        v.org.ownerId = v.newOwner.userId;

        v.org.ownerEmail = v.newOwner.email;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { orgs: [v.org] }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendSetOrgOwnerOutput => ({
          org: v.orgsService.tabToApi({ org: v.org })
        })
      )
    );
  }
}
