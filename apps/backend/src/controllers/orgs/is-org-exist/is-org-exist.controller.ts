import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { orgsTable } from '~backend/drizzle/postgres/schema/orgs';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@UseGuards(ValidateRequestGuard)
@Controller()
export class IsOrgExistController {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendIsOrgExist)
  async isOrgExist(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendIsOrgExistRequest = request.body;

    let { name } = reqValid.payload;

    let org = await this.db.drizzle.query.orgsTable.findFirst({
      where: eq(orgsTable.name, name)
    });

    let payload: apiToBackend.ToBackendIsOrgExistResponsePayload = {
      isExist: isDefined(org)
    };

    return payload;
  }
}
