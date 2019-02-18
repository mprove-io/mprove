import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as api from '@app/api/_index';
import { MyHttpService } from '@app/services/my-http.service';

@Injectable()
export class BackendService {
  constructor(protected myHttpService: MyHttpService) {}

  confirm(
    payload: api.ConfirmRequestBody['payload']
  ): Observable<api.ConfirmResponse200Body> {
    return this.myHttpService.req(api.PATH_CONFIRM, payload);
  }

  createFile(
    payload: api.CreateFileRequestBody['payload']
  ): Observable<api.CreateFileResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_FILE, payload);
  }

  deleteFile(
    payload: api.DeleteFileRequestBody['payload']
  ): Observable<api.DeleteFileResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_FILE, payload);
  }

  moveFile(
    payload: api.MoveFileRequestBody['payload']
  ): Observable<api.MoveFileResponse200Body> {
    return this.myHttpService.req(api.PATH_MOVE_FILE, payload);
  }

  saveFile(
    payload: api.SaveFileRequestBody['payload']
  ): Observable<api.SaveFileResponse200Body> {
    return this.myHttpService.req(api.PATH_SAVE_FILE, payload);
  }

  createFolder(
    payload: api.CreateFolderRequestBody['payload']
  ): Observable<api.CreateFolderResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_FOLDER, payload);
  }

  deleteFolder(
    payload: api.DeleteFolderRequestBody['payload']
  ): Observable<api.DeleteFolderResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_FOLDER, payload);
  }

  moveFolder(
    payload: api.MoveFolderRequestBody['payload']
  ): Observable<api.MoveFolderResponse200Body> {
    return this.myHttpService.req(api.PATH_MOVE_FOLDER, payload);
  }

  renameFolder(
    payload: api.RenameFolderRequestBody['payload']
  ): Observable<api.RenameFolderResponse200Body> {
    return this.myHttpService.req(api.PATH_RENAME_FOLDER, payload);
  }

  createMconfig(
    payload: api.CreateMconfigRequestBody['payload']
  ): Observable<api.CreateMconfigResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_MCONFIG, payload);
  }

  getMconfig(
    payload: api.GetMconfigRequestBody['payload']
  ): Observable<api.GetMconfigResponse200Body> {
    return this.myHttpService.req(api.PATH_GET_MCONFIG, payload);
  }

  createMember(
    payload: api.CreateMemberRequestBody['payload']
  ): Observable<api.CreateMemberResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_MEMBER, payload);
  }

  deleteMember(
    payload: api.DeleteMemberRequestBody['payload']
  ): Observable<api.DeleteMemberResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_MEMBER, payload);
  }

  editMember(
    payload: api.EditMemberRequestBody['payload']
  ): Observable<api.EditMemberResponse200Body> {
    return this.myHttpService.req(api.PATH_EDIT_MEMBER, payload);
  }

  createDashboard(
    payload: api.CreateDashboardRequestBody['payload']
  ): Observable<api.CreateDashboardResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_DASHBOARD, payload);
  }

  createMconfigAndQuery(
    payload: api.CreateMconfigAndQueryRequestBody['payload']
  ): Observable<api.CreateMconfigAndQueryResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_MCONFIG_AND_QUERY, payload);
  }

  duplicateMconfigAndQuery(
    payload: api.DuplicateMconfigAndQueryRequestBody['payload']
  ): Observable<api.DuplicateMconfigAndQueryResponse200Body> {
    return this.myHttpService.req(
      api.PATH_DUPLICATE_MCONFIG_AND_QUERY,
      payload
    );
  }

  getDashboardMconfigsQueries(
    payload: api.GetDashboardMconfigsQueriesRequestBody['payload']
  ): Observable<api.GetDashboardMconfigsQueriesResponse200Body> {
    return this.myHttpService.req(
      api.PATH_GET_DASHBOARD_MCONFIG_AND_QUERIES,
      payload
    );
  }

  setLiveQueries(
    payload: api.SetLiveQueriesRequestBody['payload']
  ): Observable<api.SetLiveQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_LIVE_QUERIES, payload);
  }

  pong(
    payload: api.PongRequestBody['payload']
  ): Observable<api.PongResponse200Body> {
    return this.myHttpService.req(api.PATH_PONG, payload);
  }

  checkProjectIdUnique(
    payload: api.CheckProjectIdUniqueRequestBody['payload']
  ): Observable<api.CheckProjectIdUniqueResponse200Body> {
    return this.myHttpService.req(api.PATH_CHECK_PROJECT_ID_UNIQUE, payload);
  }

  createProject(
    payload: api.CreateProjectRequestBody['payload']
  ): Observable<api.CreateProjectResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_PROJECT, payload);
  }

  deleteProject(
    payload: api.DeleteProjectRequestBody['payload']
  ): Observable<api.DeleteProjectResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_PROJECT, payload);
  }

  deleteProjectCredentials(
    payload: api.DeleteProjectCredentialsRequestBody['payload']
  ): Observable<api.DeleteProjectCredentialsResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_PROJECT_CREDENTIALS, payload);
  }

  setProjectCredentials(
    payload: api.SetProjectCredentialsRequestBody['payload']
  ): Observable<api.SetProjectCredentialsResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_PROJECT_CREDENTIALS, payload);
  }

  setProjectQuerySizeLimit(
    payload: api.SetProjectQuerySizeLimitRequestBody['payload']
  ): Observable<api.SetProjectQuerySizeLimitResponse200Body> {
    return this.myHttpService.req(
      api.PATH_SET_PROJECT_QUERY_SIZE_LIMIT,
      payload
    );
  }

  setProjectTimezone(
    payload: api.SetProjectTimezoneRequestBody['payload']
  ): Observable<api.SetProjectTimezoneResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_PROJECT_TIMEZONE, payload);
  }

  setProjectWeekStart(
    payload: api.SetProjectWeekStartRequestBody['payload']
  ): Observable<api.SetProjectWeekStartResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_PROJECT_WEEK_START, payload);
  }

  /**
   * POST
   * Команда на отмену действующих запросов.
   * При обработке сервер находит все query по query_id и отменяет через Bigquery
   * в случае если выполняются оба условия: - last_run_by совпадает с user_id отправителя
   * (email) - у запроса статус Running  В ответе на запрос посылаем массив Query состоящий
   * только из отмененных запросов, тех у которых поменяли статус на Canceled (при обработке запроса).
   * То есть может быть ситуация что на отмену запрошено 8 запросов, а отменили только 5 или вообще 0.
   * Оповещаем подписчиков livequeries по вебсокету
   * @param payload
   */
  cancelQueries(
    payload: api.CancelQueriesRequestBody['payload']
  ): Observable<api.CancelQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_CANCEL_QUERIES, payload);
  }

  getPdtQueries(
    payload: api.GetPdtQueriesRequestBody['payload']
  ): Observable<api.GetPdtQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_GET_PDT_QUERIES, payload);
  }

  getQueryWithDepQueries(
    payload: api.GetQueryWithDepQueriesRequestBody['payload']
  ): Observable<api.GetQueryWithDepQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_GET_QUERY_WITH_DEP_QUERIES, payload);
  }

  runQueries(
    payload: api.RunQueriesRequestBody['payload']
  ): Observable<api.RunQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_RUN_QUERIES, payload);
  }

  runQueriesDry(
    payload: api.RunQueriesDryRequestBody['payload']
  ): Observable<api.RunQueriesDryResponse200Body> {
    return this.myHttpService.req(api.PATH_RUN_QUERIES_DRY, payload);
  }

  commitRepo(
    payload: api.CommitRepoRequestBody['payload']
  ): Observable<api.CommitRepoResponse200Body> {
    return this.myHttpService.req(api.PATH_COMMIT_REPO, payload);
  }

  /**
   * POST
   * Запрос к backend на pull в dev репозиторий из prod (from_remote: false) или remote (from_remote: true)
   * репозитория.
   * После успешного пула: - делаем запрос к блокмл rebuildStruct  После получения struct: -
   * создаем/обновляем соответствующие записи dashboards, models, errors, mconfigs, queries в базе -
   * удаляем в базе dashboards, models, errors, mconfigs, queries относящиеся к дев репозиторию,
   * которые не были обновлены на предыдущем шаге (используя struct_id)
   * @param payload
   */
  pullRepo(
    payload: api.PullRepoRequestBody['payload']
  ): Observable<api.PullRepoResponse200Body> {
    return this.myHttpService.req(api.PATH_PULL_REPO, payload);
  }

  pushRepo(
    payload: api.PushRepoRequestBody['payload']
  ): Observable<api.PushRepoResponse200Body> {
    return this.myHttpService.req(api.PATH_PUSH_REPO, payload);
  }

  regenerateRepoRemotePublicKey(
    payload: api.RegenerateRepoRemotePublicKeyRequestBody['payload']
  ): Observable<api.RegenerateRepoRemotePublicKeyResponse200Body> {
    return this.myHttpService.req(
      api.PATH_REGENERATE_REPO_REMOTE_PUBLIC_KEY,
      payload
    );
  }

  regenerateRepoRemoteWebhook(
    payload: api.RegenerateRepoRemoteWebhookRequestBody['payload']
  ): Observable<api.RegenerateRepoRemoteWebhookResponse200Body> {
    return this.myHttpService.req(
      api.PATH_REGENERATE_REPO_REMOTE_WEBHOOK,
      payload
    );
  }

  revertRepoToLastCommit(
    payload: api.RevertRepoToLastCommitRequestBody['payload']
  ): Observable<api.RevertRepoToLastCommitResponse200Body> {
    return this.myHttpService.req(api.PATH_REVERT_REPO_TO_LAST_COMMIT, payload);
  }

  revertRepoToProduction(
    payload: api.RevertRepoToProductionRequestBody['payload']
  ): Observable<api.RevertRepoToProductionResponse200Body> {
    return this.myHttpService.req(api.PATH_REVERT_REPO_TO_PRODUCTION, payload);
  }

  setRepoRemoteUrl(
    payload: api.SetRepoRemoteUrlRequestBody['payload']
  ): Observable<api.SetRepoRemoteUrlResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_REPO_REMOTE_URL, payload);
  }

  getState(
    payload: api.GetStateRequestBody['payload']
  ): Observable<api.GetStateResponse200Body> {
    return this.myHttpService.req(api.PATH_GET_STATE, payload);
  }

  /**
   * POST
   * Запрос к backend на отмену всех (пока только analytics) подписок проекта.
   * В ответе: - проект, у которого analytics_plan_id меняем на дефолтный -
   * подписки, которые были отменены в результате запроса
   * @param payload
   */
  cancelSubscriptions(
    payload: api.CancelSubscriptionsRequestBody['payload']
  ): Observable<api.CancelSubscriptionsResponse200Body> {
    return this.myHttpService.req(api.PATH_CANCEL_SUBSCRIPTIONS, payload);
  }

  /**
   * POST
   * Запрос к backend на смену analytics плана проекта.
   * @param payload
   */
  switchAnalyticsSubscriptionPlan(
    payload: api.SwitchAnalyticsSubscriptionPlanRequestBody['payload']
  ): Observable<api.SwitchAnalyticsSubscriptionPlanResponse200Body> {
    return this.myHttpService.req(
      api.PATH_SWITCH_ANALYTICS_SUBSCRIPTION_PLAN,
      payload
    );
  }

  loginUser(
    payload: api.LoginUserRequestBody['payload']
  ): Observable<api.LoginUserResponse200Body> {
    return this.myHttpService.req(api.PATH_LOGIN_USER, payload);
  }

  /**
   * POST
   * Logout пользователя. Для того чтобы сервер более не принимал данный JWT token и init_id.
   * @param payload
   */
  logoutUser(
    payload: api.LogoutUserRequestBody['payload']
  ): Observable<api.LogoutUserResponse200Body> {
    return this.myHttpService.req(api.PATH_LOGOUT_USER, payload);
  }

  registerUser(
    payload: api.RegisterUserRequestBody['payload']
  ): Observable<api.RegisterUserResponse200Body> {
    return this.myHttpService.req(api.PATH_REGISTER_USER, payload);
  }

  setUserName(
    payload: api.SetUserNameRequestBody['payload']
  ): Observable<api.SetUserNameResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_USER_NAME, payload);
  }

  /**
   * POST
   * Обновление фото пользователя.  Сервер оповещает текущего клиента через: - users.updateUser
   * Сервер оповещает подписанных клиентов,
   * включая текущего, через: - members.updateMember  В ответе: - user - members -
   * набор мемберов равный кол-ву проектов в которых пользователь участвует
   * @param payload
   */
  setUserPicture(
    payload: api.SetUserPictureRequestBody['payload']
  ): Observable<api.SetUserPictureResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_USER_PICTURE, payload);
  }

  setUserThemes(
    payload: api.SetUserThemesRequestBody['payload']
  ): Observable<api.SetUserThemesResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_USER_THEMES, payload);
  }

  setUserTimezone(
    payload: api.SetUserTimezoneRequestBody['payload']
  ): Observable<api.SetUserTimezoneResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_USER_TIMEZONE, payload);
  }

  verifyUserEmail(
    payload: api.VerifyUserEmailRequestBody['payload']
  ): Observable<api.VerifyUserEmailResponse200Body> {
    return this.myHttpService.req(api.PATH_VERIFY_USER_EMAIL, payload);
  }

  resetUserPassword(
    payload: api.ResetUserPasswordRequestBody['payload']
  ): Observable<api.ResetUserPasswordResponse200Body> {
    return this.myHttpService.req(api.PATH_RESET_USER_PASSWORD, payload);
  }

  confirmUserEmail(
    payload: api.ConfirmUserEmailRequestBody['payload']
  ): Observable<api.ConfirmUserEmailResponse200Body> {
    return this.myHttpService.req(api.PATH_CONFIRM_USER_EMAIL, payload);
  }

  updateUserPassword(
    payload: api.UpdateUserPasswordRequestBody['payload']
  ): Observable<api.UpdateUserPasswordResponse200Body> {
    return this.myHttpService.req(api.PATH_UPDATE_USER_PASSWORD, payload);
  }
}
