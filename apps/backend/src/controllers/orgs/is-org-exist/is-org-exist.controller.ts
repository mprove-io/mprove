import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendIsOrgExistRequest,
  ToBackendIsOrgExistResponsePayload
} from '#common/interfaces/to-backend/orgs/to-backend-is-org-exist';
import { Db, DRIZZLE } from '~backend/drizzle/drizzle.module';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DconfigsService } from '~backend/services/db/dconfigs.service';
import { HashService } from '~backend/services/hash.service';
import { TabService } from '~backend/services/tab.service';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class IsOrgExistController {
  constructor(
    private tabService: TabService,
    private dconfigsService: DconfigsService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendIsOrgExist)
  async isOrgExist(@Req() request: any) {
    let reqValid: ToBackendIsOrgExistRequest = request.body;

    let { name } = reqValid.payload;

    let hashSecret = await this.dconfigsService.getDconfigHashSecret();

    let nameHash = this.hashService.makeHash({
      input: name,
      hashSecret: hashSecret
    });

    let org = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.nameHash, nameHash)
    });

    let payload: ToBackendIsOrgExistResponsePayload = {
      isExist: isDefined(org)
    };

    return payload;
  }
}
