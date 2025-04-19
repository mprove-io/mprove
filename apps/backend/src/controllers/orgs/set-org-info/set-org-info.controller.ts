import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~api-to-backend/barrels/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class SetOrgInfoController {
  constructor(
    private orgsService: OrgsService,
    private wrapToApiService: WrapToApiService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo)
  async setOrgInfo(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendSetOrgInfoRequest = request.body;

    let { orgId, name } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    if (common.isDefined(name)) {
      if (name.toLowerCase() === common.FIRST_ORG_NAME.toLowerCase()) {
        throw new common.ServerError({
          message: common.ErEnum.BACKEND_RESTRICTED_ORGANIZATION_NAME
        });
      }

      org.name = name;
    }

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

    let payload: apiToBackend.ToBackendSetOrgInfoResponsePayload = {
      org: this.wrapToApiService.wrapToApiOrg(org)
    };

    return payload;
  }
}
