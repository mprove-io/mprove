import * as expressWs from 'express-ws';
import { api } from './barrels/api';
import { controller } from './barrels/controller';
import { enums } from './barrels/enums';
import { handler } from './barrels/handler';

export function registerRoutes(app: expressWs.Application, middlewares: any) {
  // CYPRESS

  app.post(
    '/api/v1' + api.PATH_CYPRESS_DELETE,
    handler.catchAsyncErrors(
      controller.cypressDelete,
      enums.controllerErrorsEnum.CONTROLLER_CYPRESS_DELETE
    )
  );

  app.post(
    '/api/v1' + api.PATH_CYPRESS_SEED,
    handler.catchAsyncErrors(
      controller.cypressSeed,
      enums.controllerErrorsEnum.CONTROLLER_CYPRESS_SEED
    )
  );

  // USERS

  app.post(
    '/api/v1' + api.PATH_REGISTER_USER,
    handler.catchAsyncErrors(
      controller.registerUser,
      enums.controllerErrorsEnum.CONTROLLER_REGISTER_USER
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_USER,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteUser,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_USER
    )
  );

  app.post(
    '/api/v1' + api.PATH_VERIFY_USER_EMAIL,
    handler.catchAsyncErrors(
      controller.verifyUserEmail,
      enums.controllerErrorsEnum.CONTROLLER_VERIFY_USER_EMAIL
    )
  );

  app.post(
    '/api/v1' + api.PATH_CONFIRM_USER_EMAIL,
    handler.catchAsyncErrors(
      controller.confirmUserEmail,
      enums.controllerErrorsEnum.CONTROLLER_CONFIRM_USER_EMAIL
    )
  );

  app.post(
    '/api/v1' + api.PATH_LOGIN_USER,
    handler.catchAsyncErrors(
      controller.loginUser,
      enums.controllerErrorsEnum.CONTROLLER_LOGIN_USER
    )
  );

  app.post(
    '/api/v1' + api.PATH_RESET_USER_PASSWORD,
    handler.catchAsyncErrors(
      controller.resetUserPassword,
      enums.controllerErrorsEnum.CONTROLLER_RESET_USER_PASSWORD
    )
  );

  app.post(
    '/api/v1' + api.PATH_UPDATE_USER_PASSWORD,
    handler.catchAsyncErrors(
      controller.updateUserPassword,
      enums.controllerErrorsEnum.CONTROLLER_UPDATE_USER_PASSWORD
    )
  );

  app.post(
    '/api/v1' + api.PATH_LOGOUT_USER,
    middlewares,
    handler.catchAsyncErrors(
      controller.logoutUser,
      enums.controllerErrorsEnum.CONTROLLER_LOGOUT_USER
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_USER_NAME,
    middlewares,
    handler.catchAsyncErrors(
      controller.setUserName,
      enums.controllerErrorsEnum.CONTROLLER_SET_USER_NAME
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_USER_THEMES,
    middlewares,
    handler.catchAsyncErrors(
      controller.setUserThemes,
      enums.controllerErrorsEnum.CONTROLLER_SET_USER_THEMES
    )
  );
  app.post(
    '/api/v1' + api.PATH_SET_USER_TIMEZONE,
    middlewares,
    handler.catchAsyncErrors(
      controller.setUserTimezone,
      enums.controllerErrorsEnum.CONTROLLER_SET_USER_TIMEZONE
    )
  );

  // CONFIRM

  app.post(
    '/api/v1' + api.PATH_CONFIRM,
    middlewares,
    handler.catchAsyncErrors(
      controller.confirm,
      enums.controllerErrorsEnum.CONTROLLER_CONFIRM
    )
  );

  // PONG

  app.post(
    '/api/v1' + api.PATH_PONG,
    middlewares,
    handler.catchAsyncErrors(
      controller.pong,
      enums.controllerErrorsEnum.CONTROLLER_CONFIRM
    )
  );

  // FILES

  app.post(
    '/api/v1' + api.PATH_CREATE_FILE,
    middlewares,
    handler.catchAsyncErrors(
      controller.createFile,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_FILE
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_FILE,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteFile,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_FILE
    )
  );

  app.post(
    '/api/v1' + api.PATH_SAVE_FILE,
    middlewares,
    handler.catchAsyncErrors(
      controller.saveFile,
      enums.controllerErrorsEnum.CONTROLLER_SAVE_FILE
    )
  );

  // FOLDERS

  app.post(
    '/api/v1' + api.PATH_CREATE_FOLDER,
    middlewares,
    handler.catchAsyncErrors(
      controller.createFolder,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_FOLDER
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_FOLDER,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteFolder,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_FOLDER
    )
  );

  app.post(
    '/api/v1' + api.PATH_RENAME_FOLDER,
    middlewares,
    handler.catchAsyncErrors(
      controller.renameFolder,
      enums.controllerErrorsEnum.CONTROLLER_RENAME_FOLDER
    )
  );

  // MEMBERS

  app.post(
    '/api/v1' + api.PATH_CREATE_MEMBER,
    middlewares,
    handler.catchAsyncErrors(
      controller.createMember,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_MEMBER
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_MEMBER,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteMember,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_MEMBER
    )
  );

  app.post(
    '/api/v1' + api.PATH_EDIT_MEMBER,
    middlewares,
    handler.catchAsyncErrors(
      controller.editMember,
      enums.controllerErrorsEnum.CONTROLLER_EDIT_MEMBER
    )
  );

  // MCONFIGS

  app.post(
    '/api/v1' + api.PATH_CREATE_MCONFIG,
    middlewares,
    handler.catchAsyncErrors(
      controller.createMconfig,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_MCONFIG
    )
  );

  app.post(
    '/api/v1' + api.PATH_GET_MCONFIG,
    middlewares,
    handler.catchAsyncErrors(
      controller.getMconfig,
      enums.controllerErrorsEnum.CONTROLLER_GET_MCONFIG
    )
  );

  // MULTI

  app.post(
    '/api/v1' + api.PATH_CREATE_DASHBOARD,
    middlewares,
    handler.catchAsyncErrors(
      controller.createDashboard,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_DASHBOARD
    )
  );

  app.post(
    '/api/v1' + api.PATH_CREATE_MCONFIG_AND_QUERY,
    middlewares,
    handler.catchAsyncErrors(
      controller.createMconfigAndQuery,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_MCONFIG_AND_QUERY
    )
  );

  app.post(
    '/api/v1' + api.PATH_DUPLICATE_MCONFIG_AND_QUERY,
    middlewares,
    handler.catchAsyncErrors(
      controller.duplicateMconfigAndQuery,
      enums.controllerErrorsEnum.CONTROLLER_DUPLICATE_MCONFIG_AND_QUERY
    )
  );

  app.post(
    '/api/v1' + api.PATH_GET_DASHBOARD_MCONFIG_AND_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.getDashboardMconfigsQueries,
      enums.controllerErrorsEnum.CONTROLLER_GET_DASHBOARD_MCONFIGS_QUERIES
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_LIVE_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.setLiveQueries,
      enums.controllerErrorsEnum.CONTROLLER_SET_LIVE_QUERIES
    )
  );

  // PROJECTS

  app.post(
    '/api/v1' + api.PATH_CHECK_PROJECT_ID_UNIQUE,
    middlewares,
    handler.catchAsyncErrors(
      controller.checkProjectIdUnique,
      enums.controllerErrorsEnum.CONTROLLER_CHECK_PROJECT_ID_UNIQUE
    )
  );

  app.post(
    '/api/v1' + api.PATH_CREATE_PROJECT,
    middlewares,
    handler.catchAsyncErrors(
      controller.createProject,
      enums.controllerErrorsEnum.CONTROLLER_CREATE_PROJECT
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_PROJECT,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteProject,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_PROJECT
    )
  );

  app.post(
    '/api/v1' + api.PATH_DELETE_PROJECT_CREDENTIALS,
    middlewares,
    handler.catchAsyncErrors(
      controller.deleteProjectCredentials,
      enums.controllerErrorsEnum.CONTROLLER_DELETE_PROJECT_CREDENTIALS
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_PROJECT_CREDENTIALS,
    middlewares,
    handler.catchAsyncErrors(
      controller.setProjectCredentials,
      enums.controllerErrorsEnum.CONTROLLER_SET_PROJECT_CREDENTIALS
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_PROJECT_QUERY_SIZE_LIMIT,
    middlewares,
    handler.catchAsyncErrors(
      controller.setProjectQuerySizeLimit,
      enums.controllerErrorsEnum.CONTROLLER_SET_PROJECT_QUERY_SIZE_LIMIT
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_PROJECT_TIMEZONE,
    middlewares,
    handler.catchAsyncErrors(
      controller.setProjectTimezone,
      enums.controllerErrorsEnum.CONTROLLER_SET_PROJECT_TIMEZONE
    )
  );

  app.post(
    '/api/v1' + api.PATH_SET_PROJECT_WEEK_START,
    middlewares,
    handler.catchAsyncErrors(
      controller.setProjectWeekStart,
      enums.controllerErrorsEnum.CONTROLLER_SET_PROJECT_WEEK_START
    )
  );

  // QUERIES

  app.post(
    '/api/v1' + api.PATH_GET_PDT_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.getPdtQueries,
      enums.controllerErrorsEnum.CONTROLLER_GET_PDT_QUERIES
    )
  );

  app.post(
    '/api/v1' + api.PATH_GET_QUERY_WITH_DEP_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.getQueryWithDepQueries,
      enums.controllerErrorsEnum.CONTROLLER_GET_QUERY_WITH_DEP_QUERIES
    )
  );

  app.post(
    '/api/v1' + api.PATH_RUN_QUERIES,
    middlewares,
    handler.catchAsyncErrors(
      controller.runQueries,
      enums.controllerErrorsEnum.CONTROLLER_RUN_QUERIES
    )
  );

  app.post(
    '/api/v1' + api.PATH_RUN_QUERIES_DRY,
    middlewares,
    handler.catchAsyncErrors(
      controller.runQueriesDry,
      enums.controllerErrorsEnum.CONTROLLER_RUN_QUERIES_DRY
    )
  );

  // REPOS

  app.post(
    '/api/v1' + api.PATH_COMMIT_REPO,
    middlewares,
    handler.catchAsyncErrors(
      controller.commitRepo,
      enums.controllerErrorsEnum.CONTROLLER_COMMIT_REPO
    )
  );

  app.post(
    '/api/v1' + api.PATH_PULL_REPO,
    middlewares,
    handler.catchAsyncErrors(
      controller.pullRepo,
      enums.controllerErrorsEnum.CONTROLLER_PULL_REPO
    )
  );

  app.post(
    '/api/v1' + api.PATH_PUSH_REPO,
    middlewares,
    handler.catchAsyncErrors(
      controller.pushRepo,
      enums.controllerErrorsEnum.CONTROLLER_PUSH_REPO
    )
  );

  app.post(
    '/api/v1' + api.PATH_REVERT_REPO_TO_LAST_COMMIT,
    middlewares,
    handler.catchAsyncErrors(
      controller.revertRepoToLastCommit,
      enums.controllerErrorsEnum.CONTROLLER_REVERT_REPO_TO_LAST_COMMIT
    )
  );

  app.post(
    '/api/v1' + api.PATH_REVERT_REPO_TO_PRODUCTION,
    middlewares,
    handler.catchAsyncErrors(
      controller.revertRepoToProduction,
      enums.controllerErrorsEnum.CONTROLLER_REVERT_REPO_TO_PRODUCTION
    )
  );

  // STATE

  app.post(
    '/api/v1' + api.PATH_GET_STATE,
    middlewares,
    handler.catchAsyncErrors(
      controller.getState,
      enums.controllerErrorsEnum.CONTROLLER_GET_STATE
    )
  );
}
