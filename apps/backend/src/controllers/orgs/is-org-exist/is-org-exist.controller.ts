import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendIsOrgExistRequest,
  ToBackendIsOrgExistResponsePayload
} from '~common/interfaces/to-backend/orgs/to-backend-is-org-exist';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class IsOrgExistController {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendIsOrgExist)
  async isOrgExist(@Req() request: any) {
    let reqValid: ToBackendIsOrgExistRequest = request.body;

    let { name } = reqValid.payload;

    let org = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.name, name)
    });

    let payload: ToBackendIsOrgExistResponsePayload = {
      isExist: isDefined(org)
    };

    return payload;
  }
}
