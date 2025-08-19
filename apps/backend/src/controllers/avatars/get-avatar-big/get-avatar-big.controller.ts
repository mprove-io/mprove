import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetAvatarBigController {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
  async getAvatarBig(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetAvatarBigRequest = request.body;

    let { avatarUserId } = reqValid.payload;

    let avatar = await this.db.drizzle.query.avatarsTable.findFirst({
      where: eq(avatarsTable.userId, avatarUserId)
    });

    let payload: apiToBackend.ToBackendGetAvatarBigResponsePayload = {
      avatarSmall: avatar?.avatarSmall,
      avatarBig: avatar?.avatarBig
    };

    return payload;
  }
}
