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
import { DEMO_ORG_NAME } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendSetOrgInfoRequest,
  ToBackendSetOrgInfoResponsePayload
} from '#common/interfaces/to-backend/orgs/to-backend-set-org-info';
import { ServerError } from '#common/models/server-error';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/db/orgs.service';
import { TabService } from '~backend/services/tab.service';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SetOrgInfoController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSetOrgInfo)
  async setOrgInfo(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSetOrgInfoRequest = request.body;

    let { orgId, name } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    if (isDefined(name)) {
      if (name.toLowerCase() === DEMO_ORG_NAME.toLowerCase()) {
        throw new ServerError({
          message: ErEnum.BACKEND_RESTRICTED_ORGANIZATION_NAME
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

    let payload: ToBackendSetOrgInfoResponsePayload = {
      org: this.orgsService.tabToApi({ org: org })
    };

    return payload;
  }
}
