import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetAvatarBigRequest,
  ToBackendGetAvatarBigResponsePayload
} from '~common/interfaces/to-backend/avatars/to-backend-get-avatar-big';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetAvatarBigController {
  constructor(@Inject(DRIZZLE) private db: Db) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
  async getAvatarBig(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetAvatarBigRequest = request.body;

    let { avatarUserId } = reqValid.payload;

    let avatar = await this.db.drizzle.query.avatarsTable.findFirst({
      where: eq(avatarsTable.userId, avatarUserId)
    });

    let payload: ToBackendGetAvatarBigResponsePayload = {
      avatarSmall: avatar?.avatarSmall,
      avatarBig: avatar?.avatarBig
    };

    return payload;
  }
}
