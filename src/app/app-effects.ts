import * as effects from '@app/store/effects/_index';

export const APP_EFFECTS = [
  // App
  effects.FailEffect,
  effects.GetStateFailEffect,
  effects.GetStateSuccessEffect,
  effects.GetStateEffect,
  effects.ProcessStructsEffect,
  effects.ResetStateEffect,
  effects.UpdateStateEffect,

  // Dashboards
  effects.UpdateDashboardsStateEffect,

  // Files
  effects.CreateFileSuccessEffect,
  effects.CreateFileEffect,
  effects.DeleteFileSuccessEffect,
  effects.DeleteFileEffect,
  effects.MoveFileSuccessEffect,
  effects.MoveFileEffect,
  effects.SaveFileSuccessEffect,
  effects.SaveFileEffect,
  effects.UpdateFilesStateEffect,

  // Folders
  effects.CreateFolderSuccessEffect,
  effects.CreateFolderEffect,
  effects.DeleteFolderSuccessEffect,
  effects.DeleteFolderEffect,
  effects.RenameFolderSuccessEffect,
  effects.RenameFolderEffect,

  // Mconfigs
  effects.CreateMconfigSuccessEffect,
  effects.CreateMconfigEffect,

  // Members
  effects.CreateMemberSuccessEffect,
  effects.CreateMemberEffect,
  effects.DeleteMemberSuccessEffect,
  effects.DeleteMemberEffect,
  effects.EditMemberSuccessEffect,
  effects.EditMemberEffect,
  effects.UpdateMembersStateEffect,

  // Models
  effects.UpdateModelsStateEffect,

  // Multi
  effects.CreateDashboardSuccessEffect,
  effects.CreateDashboardEffect,
  effects.CreateMconfigAndQuerySuccessEffect,
  effects.CreateMconfigAndQueryEffect,
  effects.SetLiveQueriesSuccessEffect,
  effects.SetLiveQueriesEffect,

  // Projects
  effects.CreateProjectSuccessEffect,
  effects.CreateProjectEffect,
  effects.DeleteProjectSuccessEffect,
  effects.DeleteProjectEffect,
  effects.SetProjectCredentialsSuccessEffect,
  effects.SetProjectCredentialsEffect,
  effects.SetProjectQuerySizeLimitSuccessEffect,
  effects.SetProjectQuerySizeLimitEffect,
  effects.SetProjectTimezoneSuccessEffect,
  effects.SetProjectTimezoneEffect,
  effects.SetProjectWeekStartSuccessEffect,
  effects.SetProjectWeekStartEffect,
  effects.UpdateProjectsStateEffect,

  // Queries
  effects.CancelQueriesSuccessEffect,
  effects.CancelQueriesEffects,
  effects.RunQueriesDrySuccessEffect,
  effects.RunQueriesDryEffect,
  effects.RunQueriesSuccessEffect,
  effects.RunQueriesEffect,

  // Repos
  effects.CommitRepoSuccessEffect,
  effects.CommitRepoEffect,
  effects.PullRepoSuccessEffect,
  effects.PullRepoEffect,
  effects.PushRepoSuccessEffect,
  effects.PushRepoEffect,
  effects.RegenerateRepoRemotePublicKeySuccessEffect,
  effects.RegenerateRepoRemotePublicKeyEffect,
  effects.RegenerateRepoRemoteWebhookSuccessEffect,
  effects.RegenerateRepoRemoteWebhookEffect,
  effects.RevertRepoToLastCommitSuccessEffect,
  effects.RevertRepoToLastCommitEffect,
  effects.RevertRepoToProductionSuccessEffect,
  effects.RevertRepoToProductionEffect,
  effects.SetRepoRemoteUrlSuccessEffect,
  effects.SetRepoRemoteUrlEffect,
  effects.UpdateReposStateEffect,

  // Router
  effects.RouterEffect,

  // Subscriptions
  effects.CancelSubscriptionsSuccessEffect,
  effects.CancelSubscriptionsEffect,
  effects.SwitchAnalyticsSubscriptionPlanSuccessEffect,
  effects.SwitchAnalyticsSubscriptionPlanEffect,

  // User
  effects.ConfirmUserEmailEffect,
  effects.ConfirmUserEmailSuccessEffect,
  effects.ConfirmUserEmailFailEffect,
  effects.LoginUserEffect,
  effects.LoginUserSuccessEffect,
  effects.LoginUserFailEffect,
  effects.RegisterUserEffect,
  effects.RegisterUserSuccessEffect,
  effects.RegisterUserFailEffect,
  effects.SetUserNameSuccessEffect,
  effects.SetUserNameEffect,
  effects.SetUserPictureSuccessEffect,
  effects.SetUserPictureEffect,
  effects.SetUserThemesSuccessEffect,
  effects.SetUserThemesEffect,
  effects.SetUserTimezoneSuccessEffect,
  effects.SetUserTimezoneEffect,
  effects.LogoutUserEffect,
  effects.VerifyUserEmailEffect,
  effects.VerifyUserEmailSuccessEffect,
  effects.VerifyUserEmailFailEffect,
  effects.ResetUserPasswordEffect,
  effects.ResetUserPasswordSuccessEffect,
  effects.ResetUserPasswordFailEffect,
  effects.UpdateUserPasswordEffect,
  effects.UpdateUserPasswordSuccessEffect,
  effects.UpdateUserPasswordFailEffect,

  // WebSocket
  effects.UpdateWebSocketInitIdEffect,
  effects.OpenWebSocketEffect,
  effects.OpenWebSocketSuccessEffect,
  effects.CloseWebSocketEffect,
  effects.CloseWebSocketSuccessEffect,
  effects.ConfirmEffect,
  effects.MessagesReceivedEffect,
  effects.PingReceivedEffect,
  effects.PongEffect
];
