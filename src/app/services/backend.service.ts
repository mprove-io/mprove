import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as api from 'app/api/_index';
import { MyHttpService } from 'app/services/my-http.service';

@Injectable()
export class BackendService {
  constructor(protected myHttpService: MyHttpService) {}

  confirm(
    payload: api.ConfirmRequestBodyPayload
  ): Observable<api.ConfirmResponse200Body> {
    return this.myHttpService.req(api.PATH_CONFIRM, payload);
  }

  confirmUserEmail(
    payload: api.ConfirmUserEmailRequestBodyPayload
  ): Observable<api.ConfirmUserEmailResponse200Body> {
    return this.myHttpService.req(api.PATH_CONFIRM_USER_EMAIL, payload);
  }

  createFile(
    payload: api.CreateFileRequestBodyPayload
  ): Observable<api.CreateFileResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_FILE, payload);
  }

  deleteFile(
    payload: api.DeleteFileRequestBodyPayload
  ): Observable<api.DeleteFileResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_FILE, payload);
  }

  moveFile(
    payload: api.MoveFileRequestBodyPayload
  ): Observable<api.MoveFileResponse200Body> {
    return this.myHttpService.req(api.PATH_MOVE_FILE, payload);
  }

  saveFile(
    payload: api.SaveFileRequestBodyPayload
  ): Observable<api.SaveFileResponse200Body> {
    return this.myHttpService.req(api.PATH_SAVE_FILE, payload);
  }

  createFolder(
    payload: api.CreateFolderRequestBodyPayload
  ): Observable<api.CreateFolderResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_FOLDER, payload);
  }

  deleteFolder(
    payload: api.DeleteFolderRequestBodyPayload
  ): Observable<api.DeleteFolderResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_FOLDER, payload);
  }

  moveFolder(
    payload: api.MoveFolderRequestBodyPayload
  ): Observable<api.MoveFolderResponse200Body> {
    return this.myHttpService.req(api.PATH_MOVE_FOLDER, payload);
  }

  renameFolder(
    payload: api.RenameFolderRequestBodyPayload
  ): Observable<api.RenameFolderResponse200Body> {
    return this.myHttpService.req(api.PATH_RENAME_FOLDER, payload);
  }

  createMconfig(
    payload: api.CreateMconfigRequestBodyPayload
  ): Observable<api.CreateMconfigResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_MCONFIG, payload);
  }

  getMconfig(
    payload: api.GetMconfigRequestBodyPayload
  ): Observable<api.GetMconfigResponse200Body> {
    return this.myHttpService.req(api.PATH_GET_MCONFIG, payload);
  }

  createMember(
    payload: api.CreateMemberRequestBodyPayload
  ): Observable<api.CreateMemberResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_MEMBER, payload);
  }

  deleteMember(
    payload: api.DeleteMemberRequestBodyPayload
  ): Observable<api.DeleteMemberResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_MEMBER, payload);
  }

  editMember(
    payload: api.EditMemberRequestBodyPayload
  ): Observable<api.EditMemberResponse200Body> {
    return this.myHttpService.req(api.PATH_EDIT_MEMBER, payload);
  }

  createDashboard(
    payload: api.CreateDashboardRequestBodyPayload
  ): Observable<api.CreateDashboardResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_DASHBOARD, payload);
  }

  createMconfigAndQuery(
    payload: api.CreateMconfigAndQueryRequestBodyPayload
  ): Observable<api.CreateMconfigAndQueryResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_MCONFIG_AND_QUERY, payload);
  }

  getDashboardMconfigsQueries(
    payload: api.GetDashboardMconfigsQueriesRequestBodyPayload
  ): Observable<api.GetDashboardMconfigsQueriesResponse200Body> {
    return this.myHttpService.req(
      api.PATH_GET_DASHBOARD_MCONFIG_AND_QUERIES,
      payload
    );
  }

  setLiveQueries(
    payload: api.SetLiveQueriesRequestBodyPayload
  ): Observable<api.SetLiveQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_LIVE_QUERIES, payload);
  }

  pong(
    payload: api.PongRequestBodyPayload
  ): Observable<api.PongResponse200Body> {
    return this.myHttpService.req(api.PATH_PONG, payload);
  }

  checkProjectIdUnique(
    payload: api.CheckProjectIdUniqueRequestBodyPayload
  ): Observable<api.CheckProjectIdUniqueResponse200Body> {
    return this.myHttpService.req(api.PATH_CHECK_PROJECT_ID_UNIQUE, payload);
  }

  createProject(
    payload: api.CreateProjectRequestBodyPayload
  ): Observable<api.CreateProjectResponse200Body> {
    return this.myHttpService.req(api.PATH_CREATE_PROJECT, payload);
  }

  deleteProject(
    payload: api.DeleteProjectRequestBodyPayload
  ): Observable<api.DeleteProjectResponse200Body> {
    return this.myHttpService.req(api.PATH_DELETE_PROJECT, payload);
  }

  setProjectCredentials(
    payload: api.SetProjectCredentialsRequestBodyPayload
  ): Observable<api.SetProjectCredentialsResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_PROJECT_CREDENTIALS, payload);
  }

  setProjectQuerySizeLimit(
    payload: api.SetProjectQuerySizeLimitRequestBodyPayload
  ): Observable<api.SetProjectQuerySizeLimitResponse200Body> {
    return this.myHttpService.req(
      api.PATH_SET_PROJECT_QUERY_SIZE_LIMIT,
      payload
    );
  }

  setProjectTimezone(
    payload: api.SetProjectTimezoneRequestBodyPayload
  ): Observable<api.SetProjectTimezoneResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_PROJECT_TIMEZONE, payload);
  }

  setProjectWeekStart(
    payload: api.SetProjectWeekStartRequestBodyPayload
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
    payload: api.CancelQueriesRequestBodyPayload
  ): Observable<api.CancelQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_CANCEL_QUERIES, payload);
  }

  getPdtQueries(
    payload: api.GetPdtQueriesRequestBodyPayload
  ): Observable<api.GetPdtQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_GET_PDT_QUERIES, payload);
  }

  getQueryWithDepQueries(
    payload: api.GetQueryWithDepQueriesRequestBodyPayload
  ): Observable<api.GetQueryWithDepQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_GET_QUERY_WITH_DEP_QUERIES, payload);
  }

  runQueries(
    payload: api.RunQueriesRequestBodyPayload
  ): Observable<api.RunQueriesResponse200Body> {
    return this.myHttpService.req(api.PATH_RUN_QUERIES, payload);
  }

  runQueriesDry(
    payload: api.RunQueriesDryRequestBodyPayload
  ): Observable<api.RunQueriesDryResponse200Body> {
    return this.myHttpService.req(api.PATH_RUN_QUERIES_DRY, payload);
  }

  commitRepo(
    payload: api.CommitRepoRequestBodyPayload
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
    payload: api.PullRepoRequestBodyPayload
  ): Observable<api.PullRepoResponse200Body> {
    return this.myHttpService.req(api.PATH_PULL_REPO, payload);
  }

  pushRepo(
    payload: api.PushRepoRequestBodyPayload
  ): Observable<api.PushRepoResponse200Body> {
    return this.myHttpService.req(api.PATH_PUSH_REPO, payload);
  }

  regenerateRepoRemotePublicKey(
    payload: api.RegenerateRepoRemotePublicKeyRequestBodyPayload
  ): Observable<api.RegenerateRepoRemotePublicKeyResponse200Body> {
    return this.myHttpService.req(
      api.PATH_REGENERATE_REPO_REMOTE_PUBLIC_KEY,
      payload
    );
  }

  regenerateRepoRemoteWebhook(
    payload: api.RegenerateRepoRemoteWebhookRequestBodyPayload
  ): Observable<api.RegenerateRepoRemoteWebhookResponse200Body> {
    return this.myHttpService.req(
      api.PATH_REGENERATE_REPO_REMOTE_WEBHOOK,
      payload
    );
  }

  revertRepoToLastCommit(
    payload: api.RevertRepoToLastCommitRequestBodyPayload
  ): Observable<api.RevertRepoToLastCommitResponse200Body> {
    return this.myHttpService.req(api.PATH_REVERT_REPO_TO_LAST_COMMIT, payload);
  }

  revertRepoToProduction(
    payload: api.RevertRepoToProductionRequestBodyPayload
  ): Observable<api.RevertRepoToProductionResponse200Body> {
    return this.myHttpService.req(api.PATH_REVERT_REPO_TO_PRODUCTION, payload);
  }

  setRepoRemoteUrl(
    payload: api.SetRepoRemoteUrlRequestBodyPayload
  ): Observable<api.SetRepoRemoteUrlResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_REPO_REMOTE_URL, payload);
  }

  getState(
    payload: api.GetStateRequestBodyPayload
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
    payload: api.CancelSubscriptionsRequestBodyPayload
  ): Observable<api.CancelSubscriptionsResponse200Body> {
    return this.myHttpService.req(api.PATH_CANCEL_SUBSCRIPTIONS, payload);
  }

  /**
   * POST
   * Запрос к backend на смену analytics плана проекта.
   * @param payload
   */
  switchAnalyticsSubscriptionPlan(
    payload: api.SwitchAnalyticsSubscriptionPlanRequestBodyPayload
  ): Observable<api.SwitchAnalyticsSubscriptionPlanResponse200Body> {
    return this.myHttpService.req(
      api.PATH_SWITCH_ANALYTICS_SUBSCRIPTION_PLAN,
      payload
    );
  }

  loginUser(
    payload: api.LoginUserRequestBodyPayload
  ): Observable<api.LoginUserResponse200Body> {
    return this.myHttpService.req(api.PATH_LOGIN_USER, payload);
  }

  /**
   * POST
   * Logout пользователя. Для того чтобы сервер более не принимал данный JWT token и init_id.
   * @param payload
   */
  logoutUser(
    payload: api.LogoutUserRequestBodyPayload
  ): Observable<api.LogoutUserResponse200Body> {
    return this.myHttpService.req(api.PATH_LOGOUT_USER, payload);
  }

  registerUser(
    payload: api.RegisterUserRequestBodyPayload
  ): Observable<api.RegisterUserResponse200Body> {
    return this.myHttpService.req(api.PATH_REGISTER_USER, payload);
  }

  setUserName(
    payload: api.SetUserNameRequestBodyPayload
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
    payload: api.SetUserPictureRequestBodyPayload
  ): Observable<api.SetUserPictureResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_USER_PICTURE, payload);
  }

  setUserTimezone(
    payload: api.SetUserTimezoneRequestBodyPayload
  ): Observable<api.SetUserTimezoneResponse200Body> {
    return this.myHttpService.req(api.PATH_SET_USER_TIMEZONE, payload);
  }

  verifyUserEmail(
    payload: api.VerifyUserEmailRequestBodyPayload
  ): Observable<api.VerifyUserEmailResponse200Body> {
    return this.myHttpService.req(api.PATH_VERIFY_USER_EMAIL, payload);
  }

  resetUserPassword(
    payload: api.ResetUserPasswordRequestBodyPayload
  ): Observable<api.ResetUserPasswordResponse200Body> {
    return this.myHttpService.req(api.PATH_RESET_USER_PASSWORD, payload);
  }
}
