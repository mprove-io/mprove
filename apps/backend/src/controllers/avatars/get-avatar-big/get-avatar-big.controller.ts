import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { AvatarsService } from '~backend/services/db/avatars.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetAvatarBigRequest,
  ToBackendGetAvatarBigResponsePayload
} from '~common/interfaces/to-backend/avatars/to-backend-get-avatar-big';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetAvatarBigController {
  constructor(
    private avatarsService: AvatarsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
  async getAvatarBig(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetAvatarBigRequest = request.body;

    let { avatarUserId } = reqValid.payload;

    let avatar = await this.db.drizzle.query.avatarsTable
      .findFirst({
        where: eq(avatarsTable.userId, avatarUserId)
      })
      .then(x => this.avatarsService.entToTab(x));

    let payload: ToBackendGetAvatarBigResponsePayload = {
      avatarSmall: avatar?.avatarSmall,
      avatarBig: avatar?.avatarBig
    };

    return payload;
  }
}
