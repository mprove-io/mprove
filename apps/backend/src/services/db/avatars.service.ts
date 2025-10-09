import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { AvatarTab } from '~backend/drizzle/postgres/schema/_tabs';
import { AvatarEnt } from '~backend/drizzle/postgres/schema/avatars';
import { isUndefined } from '~common/functions/is-undefined';
import { AvatarLt, AvatarSt } from '~common/interfaces/st-lt';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class AvatarsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(avatarEnt: AvatarEnt): AvatarTab {
    if (isUndefined(avatarEnt)) {
      return;
    }

    let avatar: AvatarTab = {
      ...avatarEnt,
      ...this.tabService.decrypt<AvatarSt>({
        encryptedString: avatarEnt.st
      }),
      ...this.tabService.decrypt<AvatarLt>({
        encryptedString: avatarEnt.lt
      })
    };

    return avatar;
  }
}
