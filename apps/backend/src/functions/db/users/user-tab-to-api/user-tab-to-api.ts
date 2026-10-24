import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { Ui } from '#common/types/backend/parts/ui/ui';
import type { User } from '#common/types/backend/parts/user';

export function userTabToApi(item: { user: UserTab }): User {
  let { user } = item;

  let defaultSrvUi: Ui = makeCopy(DEFAULT_SRV_UI);

  let apiUser: User = {
    userId: user.userId,
    email: user.email,
    alias: user.alias,
    firstName: user.firstName,
    lastName: user.lastName,
    isEmailVerified: user.isEmailVerified,
    apiKeyPrefix: user.apiKeyPrefix,
    ui: {
      timezone: user.ui?.timezone || defaultSrvUi.timezone,
      timeSpec: user.ui?.timeSpec || defaultSrvUi.timeSpec,
      timeRangeFraction:
        user.ui?.timeRangeFraction || defaultSrvUi.timeRangeFraction,
      //
      projectModelLinks: isDefined(user.ui?.projectModelLinks)
        ? user.ui?.projectModelLinks
        : defaultSrvUi.projectModelLinks,
      //
      projectChartLinks: isDefined(user.ui?.projectChartLinks)
        ? user.ui?.projectChartLinks
        : defaultSrvUi.projectChartLinks,
      //
      projectDashboardLinks: isDefined(user.ui?.projectDashboardLinks)
        ? user.ui?.projectDashboardLinks
        : defaultSrvUi.projectDashboardLinks,
      //
      projectExplorerSessionLinks: isDefined(
        user.ui?.projectExplorerSessionLinks
      )
        ? user.ui?.projectExplorerSessionLinks
        : defaultSrvUi.projectExplorerSessionLinks,
      //
      projectReportLinks: isDefined(user.ui?.projectReportLinks)
        ? user.ui?.projectReportLinks
        : defaultSrvUi.projectReportLinks,
      //
      projectSelectedGivenLinks: isDefined(user.ui?.projectSelectedGivenLinks)
        ? user.ui?.projectSelectedGivenLinks
        : defaultSrvUi.projectSelectedGivenLinks,
      //
      chartsByModel: isDefined(user.ui?.chartsByModel)
        ? user.ui?.chartsByModel
        : defaultSrvUi.chartsByModel,
      //
      modelTreeLevels: isDefined(user.ui?.modelTreeLevels)
        ? user.ui?.modelTreeLevels
        : defaultSrvUi.modelTreeLevels,
      //
      permissionsAutoAcceptSessionIds: isDefined(
        user.ui?.permissionsAutoAcceptSessionIds
      )
        ? user.ui?.permissionsAutoAcceptSessionIds
        : defaultSrvUi.permissionsAutoAcceptSessionIds,
      //
      newSessionPermissionsAutoAccept: isDefined(
        user.ui?.newSessionPermissionsAutoAccept
      )
        ? user.ui?.newSessionPermissionsAutoAccept
        : defaultSrvUi.newSessionPermissionsAutoAccept,
      //
      newSessionExplorerModelExtraId: isDefined(
        user.ui?.newSessionExplorerModelExtraId
      )
        ? user.ui?.newSessionExplorerModelExtraId
        : defaultSrvUi.newSessionExplorerModelExtraId,
      //
      newSessionExplorerVariant: isDefined(user.ui?.newSessionExplorerVariant)
        ? user.ui?.newSessionExplorerVariant
        : defaultSrvUi.newSessionExplorerVariant,
      //
      newSessionEditorModelExtraId: isDefined(
        user.ui?.newSessionEditorModelExtraId
      )
        ? user.ui?.newSessionEditorModelExtraId
        : defaultSrvUi.newSessionEditorModelExtraId,
      //
      newSessionEditorVariant: isDefined(user.ui?.newSessionEditorVariant)
        ? user.ui?.newSessionEditorVariant
        : defaultSrvUi.newSessionEditorVariant
    },
    isCodexAuthSet: isDefined(user.codexAuth),
    codexAuthUpdateTs: user.codexAuthUpdateTs,
    codexAuthExpiresTs: user.codexAuthExpiresTs,
    serverTs: Number(user.serverTs)
  };

  return apiUser;
}
