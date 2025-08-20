import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserEnt, usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '~common/functions/is-undefined';
import {
  ToBackendSetOrgOwnerRequest,
  ToBackendSetOrgOwnerResponsePayload
} from '~common/interfaces/to-backend/orgs/to-backend-set-org-owner';
import { ServerError } from '~common/models/server-error';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetOrgOwnerController {
  constructor(
    private orgsService: OrgsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner)
  async setOrgOwner(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendSetOrgOwnerRequest = request.body;

    let { orgId, ownerEmail } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let newOwner = await this.db.drizzle.query.usersTable.findFirst({
      where: and(
        eq(usersTable.email, ownerEmail),
        eq(usersTable.isEmailVerified, true)
      )
    });

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
      org: this.wrapToApiService.wrapToApiOrg(org)
    };

    return payload;
  }
}
