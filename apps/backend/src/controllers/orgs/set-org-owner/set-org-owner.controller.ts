import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DconfigsService } from '~backend/services/db/dconfigs.service';
import { OrgsService } from '~backend/services/db/orgs.service';
import { HashService } from '~backend/services/hash.service';
import { TabService } from '~backend/services/tab.service';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import {
  ToBackendSetOrgOwnerRequest,
  ToBackendSetOrgOwnerResponsePayload
} from '~common/interfaces/to-backend/orgs/to-backend-set-org-owner';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
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

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner)
  async setOrgOwner(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetOrgOwnerRequest = request.body;

    let { orgId, ownerEmail } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let ownerEmailHash = this.hashService.makeHash({
      input: ownerEmail,
      hashSecret: hashSecret
    });

    let newOwner = await this.db.drizzle.query.usersTable
      .findFirst({
        where: and(
          eq(usersTable.emailHash, ownerEmailHash),
          eq(usersTable.isEmailVerified, true)
        )
      })
      .then(x => this.tabService.userEntToTab(x));

    if (isUndefined(newOwner)) {
      throw new ServerError({
        message: ErEnum.BACKEND_NEW_OWNER_NOT_FOUND
      });
    }

    org.ownerId = newOwner.userId;
    org.ownerEmail = newOwner.email;

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                orgs: [org]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendSetOrgOwnerResponsePayload = {
      org: this.orgsService.tabToApi({ org: org })
    };

    return payload;
  }
}
