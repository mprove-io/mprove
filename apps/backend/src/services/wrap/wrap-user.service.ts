import { Injectable } from '@nestjs/common';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import {
  UserLt,
  UserSt,
  UserTab
} from '~backend/drizzle/postgres/tabs/user-tab';
import { DEFAULT_SRV_UI } from '~common/constants/top-backend';
import { isDefined } from '~common/functions/is-defined';
import { makeCopy } from '~common/functions/make-copy';
import { User } from '~common/interfaces/backend/user';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapUserService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  tabToApi(item: { user: UserTab }): User {
    let { user } = item;

    let defaultSrvUi = makeCopy(DEFAULT_SRV_UI);

    let apiUser: User = {
      userId: user.userId,
      email: user.lt.email,
      alias: user.lt.alias,
      firstName: user.lt.firstName,
      lastName: user.lt.lastName,
      isEmailVerified: user.isEmailVerified,
      ui: {
        timezone: user.lt.ui?.timezone || defaultSrvUi.timezone,
        timeSpec: user.lt.ui?.timeSpec || defaultSrvUi.timeSpec,
        timeRangeFraction:
          user.lt.ui?.timeRangeFraction || defaultSrvUi.timeRangeFraction,

        projectFileLinks: isDefined(user.lt.ui?.projectFileLinks)
          ? user.lt.ui?.projectFileLinks
          : defaultSrvUi.projectFileLinks,

        projectModelLinks: isDefined(user.lt.ui?.projectModelLinks)
          ? user.lt.ui?.projectModelLinks
          : defaultSrvUi.projectModelLinks,

        projectChartLinks: isDefined(user.lt.ui?.projectChartLinks)
          ? user.lt.ui?.projectChartLinks
          : defaultSrvUi.projectChartLinks,

        projectDashboardLinks: isDefined(user.lt.ui?.projectDashboardLinks)
          ? user.lt.ui?.projectDashboardLinks
          : defaultSrvUi.projectDashboardLinks,

        projectReportLinks: isDefined(user.lt.ui?.projectReportLinks)
          ? user.lt.ui?.projectReportLinks
          : defaultSrvUi.projectReportLinks,

        modelTreeLevels: isDefined(user.lt.ui?.modelTreeLevels)
          ? user.lt.ui?.modelTreeLevels
          : defaultSrvUi.modelTreeLevels
      },
      serverTs: Number(user.serverTs)
    };

    return apiUser;
  }

  tabToEnt(user: UserTab): UserEnt {
    let userEnt: UserEnt = {
      ...user,
      st: this.tabService.encrypt({ data: user.st }),
      lt: this.tabService.encrypt({ data: user.lt })
    };

    return userEnt;
  }

  entToTab(user: UserEnt): UserTab {
    let userTab: UserTab = {
      ...user,
      st: this.tabService.decrypt<UserSt>({
        encryptedString: user.st
      }),
      lt: this.tabService.decrypt<UserLt>({
        encryptedString: user.lt
      })
    };

    return userTab;
  }
}
