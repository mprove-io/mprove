import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { AvatarTab } from '~backend/drizzle/postgres/schema/_tabs';
import { AvatarEnt } from '~backend/drizzle/postgres/schema/avatars';
import { isUndefined } from '~common/functions/is-undefined';
import { TabService } from '../tab.service';

@Injectable()
export class AvatarsService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(avatarEnt: AvatarEnt): AvatarTab {
    if (isUndefined(avatarEnt)) {
      return;
    }

    let avatar: AvatarTab = {
      ...avatarEnt,
      ...this.tabService.getTabProps({ ent: avatarEnt })
    };

    return avatar;
  }
}
