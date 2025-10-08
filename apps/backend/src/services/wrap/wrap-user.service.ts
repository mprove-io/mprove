import { Injectable } from '@nestjs/common';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { UserTab } from '~common/interfaces/backend/user-tab';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapUserService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  wrapToApiUser(item: { user: UserEnt }): User {
    let { user } = item;

    let userTab = this.tabService.decrypt<UserTab>({
      encryptedString: user.tab
    });

    let defaultSrvUi = makeCopy(DEFAULT_SRV_UI);

    let apiUser: User = {
      userId: user.userId,
      email: userTab.email,
      alias: userTab.alias,
      firstName: userTab.firstName,
      lastName: userTab.lastName,
      isEmailVerified: user.isEmailVerified,
      ui: {
        timezone: userTab.ui?.timezone || defaultSrvUi.timezone,
        timeSpec: userTab.ui?.timeSpec || defaultSrvUi.timeSpec,
        timeRangeFraction:
          userTab.ui?.timeRangeFraction || defaultSrvUi.timeRangeFraction,

        projectFileLinks: isDefined(userTab.ui?.projectFileLinks)
          ? userTab.ui?.projectFileLinks
          : defaultSrvUi.projectFileLinks,

        projectModelLinks: isDefined(userTab.ui?.projectModelLinks)
          ? userTab.ui?.projectModelLinks
          : defaultSrvUi.projectModelLinks,

        projectChartLinks: isDefined(userTab.ui?.projectChartLinks)
          ? userTab.ui?.projectChartLinks
          : defaultSrvUi.projectChartLinks,

        projectDashboardLinks: isDefined(userTab.ui?.projectDashboardLinks)
          ? userTab.ui?.projectDashboardLinks
          : defaultSrvUi.projectDashboardLinks,

        projectReportLinks: isDefined(userTab.ui?.projectReportLinks)
          ? userTab.ui?.projectReportLinks
          : defaultSrvUi.projectReportLinks,

        modelTreeLevels: isDefined(userTab.ui?.modelTreeLevels)
          ? userTab.ui?.modelTreeLevels
          : defaultSrvUi.modelTreeLevels
      },
      serverTs: Number(user.serverTs)
    };

    return apiUser;
  }
}
