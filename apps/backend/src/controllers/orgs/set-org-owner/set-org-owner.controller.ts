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
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { usersTable } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetOrgOwnerController {
  constructor(
    private orgsService: OrgsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgOwner)
  async setOrgOwner(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSetOrgOwnerRequest = request.body;

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

    if (common.isUndefined(newOwner)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_NEW_OWNER_NOT_FOUND
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

    let payload: apiToBackend.ToBackendSetOrgOwnerResponsePayload = {
      org: this.wrapToApiService.wrapToApiOrg(org)
    };

    return payload;
  }
}
