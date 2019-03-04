import * as effects from '@app/store-actions/effects';

export const APP_EFFECTS = [
  // Confirm
  effects.ConfirmEffect,

  // Files
  effects.CreateFileSuccessEffect,
  effects.CreateFileFailEffect,
  effects.CreateFileEffect,

  effects.DeleteFileSuccessEffect,
  effects.DeleteFileFailEffect,
  effects.DeleteFileEffect,

  effects.MoveFileSuccessEffect,
  effects.MoveFileFailEffect,
  effects.MoveFileEffect,

  effects.SaveFileSuccessEffect,
  effects.SaveFileFailEffect,
  effects.SaveFileEffect,

  // Folders
  effects.CreateFolderSuccessEffect,
  effects.CreateFolderFailEffect,
  effects.CreateFolderEffect,

  effects.DeleteFolderSuccessEffect,
  effects.DeleteFolderFailEffect,
  effects.DeleteFolderEffect,

  effects.RenameFolderSuccessEffect,
  effects.RenameFolderFailEffect,
  effects.RenameFolderEffect,

  // Get state
  effects.GetStateSuccessEffect,
  effects.GetStateFailEffect,
  effects.GetStateEffect,

  // Mconfigs
  effects.CreateMconfigSuccessEffect,
  effects.CreateMconfigFailEffect,
  effects.CreateMconfigEffect,

  // Members
  effects.CreateMemberSuccessEffect,
  effects.CreateMemberFailEffect,
  effects.CreateMemberEffect,

  effects.DeleteMemberSuccessEffect,
  effects.DeleteMemberFailEffect,
  effects.DeleteMemberEffect,

  effects.EditMemberSuccessEffect,
  effects.EditMemberFailEffect,
  effects.EditMemberEffect,

  // Multi
  effects.CreateDashboardSuccessEffect,
  effects.CreateDashboardFailEffect,
  effects.CreateDashboardEffect,

  effects.CreateMconfigAndQuerySuccessEffect,
  effects.CreateMconfigAndQueryFailEffect,
  effects.CreateMconfigAndQueryEffect,

  effects.DuplicateMconfigAndQuerySuccessEffect,
  effects.DuplicateMconfigAndQueryFailEffect,
  effects.DuplicateMconfigAndQueryEffect,

  effects.SetLiveQueriesSuccessEffect,
  effects.SetLiveQueriesFailEffect,
  effects.SetLiveQueriesEffect,

  // Pong
  effects.PongEffect,

  // Projects
  effects.CreateProjectSuccessEffect,
  effects.CreateProjectFailEffect,
  effects.CreateProjectEffect,

  effects.DeleteProjectSuccessEffect,
  effects.DeleteProjectFailEffect,
  effects.DeleteProjectEffect,

  effects.DeleteProjectCredentialsSuccessEffect,
  effects.DeleteProjectCredentialsFailEffect,
  effects.DeleteProjectCredentialsEffect,

  effects.SetProjectCredentialsSuccessEffect,
  effects.SetProjectCredentialsFailEffect,
  effects.SetProjectCredentialsEffect,

  effects.SetProjectQuerySizeLimitSuccessEffect,
  effects.SetProjectQuerySizeLimitFailEffect,
  effects.SetProjectQuerySizeLimitEffect,

  effects.SetProjectTimezoneSuccessEffect,
  effects.SetProjectTimezoneFailEffect,
  effects.SetProjectTimezoneEffect,

  effects.SetProjectWeekStartSuccessEffect,
  effects.SetProjectWeekStartFailEffect,
  effects.SetProjectWeekStartEffect,

  // Queries
  effects.CancelQueriesSuccessEffect,
  effects.CancelQueriesFailEffect,
  effects.CancelQueriesEffects,

  effects.RunQueriesDrySuccessEffect,
  effects.RunQueriesDryFailEffect,
  effects.RunQueriesDryEffect,

  effects.RunQueriesSuccessEffect,
  effects.RunQueriesFailEffect,
  effects.RunQueriesEffect,

  // Repos
  effects.CommitRepoSuccessEffect,
  effects.CommitRepoFailEffect,
  effects.CommitRepoEffect,

  effects.PullRepoSuccessEffect,
  effects.PullRepoFailEffect,
  effects.PullRepoEffect,

  effects.PushRepoSuccessEffect,
  effects.PushRepoFailEffect,
  effects.PushRepoEffect,

  effects.RegenerateRepoRemotePublicKeySuccessEffect,
  effects.RegenerateRepoRemotePublicKeyFailEffect,
  effects.RegenerateRepoRemotePublicKeyEffect,

  effects.RegenerateRepoRemoteWebhookSuccessEffect,
  effects.RegenerateRepoRemoteWebhookFailEffect,
  effects.RegenerateRepoRemoteWebhookEffect,

  effects.RevertRepoToLastCommitSuccessEffect,
  effects.RevertRepoToLastCommitFailEffect,
  effects.RevertRepoToLastCommitEffect,

  effects.RevertRepoToProductionSuccessEffect,
  effects.RevertRepoToProductionFailEffect,
  effects.RevertRepoToProductionEffect,

  effects.SetRepoRemoteUrlSuccessEffect,
  effects.SetRepoRemoteUrlFailEffect,
  effects.SetRepoRemoteUrlEffect,

  // Subscriptions
  effects.CancelSubscriptionsSuccessEffect,
  effects.CancelSubscriptionsFailEffect,
  effects.CancelSubscriptionsEffect,

  effects.SwitchAnalyticsSubscriptionPlanSuccessEffect,
  effects.SwitchAnalyticsSubscriptionPlanFailEffect,
  effects.SwitchAnalyticsSubscriptionPlanEffect,

  // User
  effects.ConfirmUserEmailSuccessEffect,
  effects.ConfirmUserEmailFailEffect,
  effects.ConfirmUserEmailEffect,

  effects.DeleteUserSuccessEffect,
  effects.DeleteUserFailEffect,
  effects.DeleteUserEffect,

  effects.LoginUserSuccessEffect,
  effects.LoginUserFailEffect,
  effects.LoginUserEffect,

  effects.RegisterUserSuccessEffect,
  effects.RegisterUserFailEffect,
  effects.RegisterUserEffect,

  effects.SetUserNameSuccessEffect,
  effects.SetUserNameFailEffect,
  effects.SetUserNameEffect,

  effects.SetUserPictureSuccessEffect,
  effects.SetUserPictureFailEffect,
  effects.SetUserPictureEffect,

  effects.SetUserThemesSuccessEffect,
  effects.SetUserThemesFailEffect,
  effects.SetUserThemesEffect,

  effects.SetUserTimezoneSuccessEffect,
  effects.SetUserTimezoneFailEffect,
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

  // State
  effects.ProcessStructsEffect,
  effects.ResetStateEffect,

  effects.UpdateStateEffect,
  effects.UpdateDashboardsStateEffect,
  effects.UpdateFilesStateEffect,
  effects.UpdateMembersStateEffect,
  effects.UpdateModelsStateEffect,
  effects.UpdateProjectsStateEffect,
  effects.UpdateReposStateEffect,
  effects.UpdateUserStateEffect,

  // Other
  effects.BackendFailEffect,
  effects.RouterEffect,

  // WebSocket
  effects.CloseWebSocketSuccessEffect,
  effects.CloseWebSocketEffect,

  effects.OpenWebSocketSuccessEffect,
  effects.OpenWebSocketEffect,

  effects.PingReceivedEffect,
  effects.StateReceivedEffect,
  effects.UpdateWebSocketInitIdEffect
];
