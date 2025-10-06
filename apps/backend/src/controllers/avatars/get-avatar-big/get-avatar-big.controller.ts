import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { avatarsTable } from '~backend/drizzle/postgres/schema/avatars';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { TabService } from '~backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { AvatarTab } from '~common/interfaces/backend/avatar-tab';
import {
  ToBackendGetAvatarBigRequest,
  ToBackendGetAvatarBigResponsePayload
} from '~common/interfaces/to-backend/avatars/to-backend-get-avatar-big';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetAvatarBigController {
  constructor(
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAvatarBig)
  async getAvatarBig(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGetAvatarBigRequest = request.body;

    let { avatarUserId } = reqValid.payload;

    let avatar = await this.db.drizzle.query.avatarsTable.findFirst({
      where: eq(avatarsTable.userId, avatarUserId)
    });

    let avatarTab = isDefined(avatar)
      ? this.tabService.decrypt<AvatarTab>({
          encryptedString: avatar.tab
        })
      : undefined;

    let payload: ToBackendGetAvatarBigResponsePayload = {
      avatarSmall: avatarTab?.avatarSmall,
      avatarBig: avatarTab?.avatarBig
    };

    return payload;
  }
}
