import { Request, Response } from 'express';
import { forEach } from 'p-iteration';
import { Equal, In } from 'typeorm';
import { api } from '../../../barrels/api';
import { constants } from '../../../barrels/constants';
import { entities } from '../../../barrels/entities';
import { enums } from '../../../barrels/enums';
import { generator } from '../../../barrels/generator';
import { helper } from '../../../barrels/helper';
import { sender } from '../../../barrels/sender';
import { store } from '../../../barrels/store';
import { wrapper } from '../../../barrels/wrapper';
import { ServerError } from '../../server-error';

export async function getState(req: Request, res: Response) {
  let userId = req.user.email;

  let sessionId = helper.makeId();

  let newSession = generator.makeSession({
    session_id: sessionId,
    user_id: userId,
    is_activated: enums.bEnum.FALSE
  });

  let storeSessions = store.getSessionsRepo();
  let storeUsers = store.getUsersRepo();
  let storeMembers = store.getMembersRepo();
  let storeProjects = store.getProjectsRepo();
  let storeRepos = store.getReposRepo();
  let storeFiles = store.getFilesRepo();

  await storeSessions
    .insert(newSession)
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_SESSIONS_INSERT));

  let user = <entities.UserEntity>(
    await storeUsers
      .findOne(userId)
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_USERS_FIND_ONE))
  );

  if (!user) {
    throw new ServerError({
      name: enums.otherErrorsEnum.GET_STATE_ERROR_USER_DOES_NOT_EXIST
    });
  }

  let userMembers = <entities.MemberEntity[]>await storeMembers
    .find({
      member_id: userId,
      deleted: Equal(enums.bEnum.FALSE)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND));

  let projectsIds = userMembers.map(userMember => userMember.project_id);

  let projects = <entities.ProjectEntity[]>await storeProjects
    .find({
      project_id: In(projectsIds),
      deleted: Equal(enums.bEnum.FALSE)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_PROJECTS_FIND));

  let members = <entities.MemberEntity[]>await storeMembers
    .find({
      project_id: In(projectsIds),
      deleted: Equal(enums.bEnum.FALSE)
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MEMBERS_FIND));

  let repos = <entities.RepoEntity[]>await storeRepos
    .find({
      project_id: In(projectsIds),
      repo_id: In([userId, constants.PROD_REPO_ID])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_REPOS_FIND));

  let files = <entities.FileEntity[]>await storeFiles
    .find({
      project_id: In(projectsIds),
      repo_id: In([userId, constants.PROD_REPO_ID])
    })
    .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_FILES_FIND));

  let structs: api.Struct[] = [];

  await forEach(repos, async repo => {
    let storeErrors = store.getErrorsRepo();
    let storeModels = store.getModelsRepo();
    let storeDashboards = store.getDashboardsRepo();

    let errors = <entities.ErrorEntity[]>await storeErrors
      .find({
        struct_id: repo.struct_id,
        repo_id: repo.repo_id
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_ERRORS_FIND));

    let models = <entities.ModelEntity[]>await storeModels
      .find({
        struct_id: repo.struct_id,
        repo_id: repo.repo_id
      })
      .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_MODELS_FIND));

    let dashboards = <entities.DashboardEntity[]>await storeDashboards
      .find({
        struct_id: repo.struct_id,
        repo_id: repo.repo_id
      })
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.STORE_DASHBOARDS_FIND)
      );

    let struct: api.Struct = {
      repo: wrapper.wrapToApiRepo(repo),
      errors: errors.map(error => wrapper.wrapToApiError(error)),
      models: models.map(model => wrapper.wrapToApiModel(model)),
      dashboards: dashboards.map(dashboard =>
        wrapper.wrapToApiDashboard(dashboard)
      )
    };

    structs.push(struct);
  });

  let payload: api.GetStateResponse200BodyPayload = {
    init_id: sessionId,
    state: {
      user: wrapper.wrapToApiUser(user, enums.bEnum.FALSE),
      projects: projects.map(project => wrapper.wrapToApiProject(project)),
      subscriptions: [],
      payments: [],
      members: members.map(member => wrapper.wrapToApiMember(member)),
      files: files.map(file => wrapper.wrapToApiFile(file)),
      structs: structs
    }
  };

  sender.sendClientResponse(req, res, payload);
}
