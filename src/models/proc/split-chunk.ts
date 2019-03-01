import * as expressWs from 'express-ws';
import { forEach } from 'p-iteration';
import { api } from '../../barrels/api';
import { constants } from '../../barrels/constants';
import { entities } from '../../barrels/entities';
import { enums } from '../../barrels/enums';
import { generator } from '../../barrels/generator';
import { helper } from '../../barrels/helper';
import { handler } from '../../barrels/handler';
import { interfaces } from '../../barrels/interfaces';
import { store } from '../../barrels/store';
import { wrapper } from '../../barrels/wrapper';
import { MemberEntity } from '../store/entities/_index';
import { In } from 'typeorm';

export async function splitChunk(item: {
  ws_clients_open: interfaces.WebsocketClient[];
  chunk: entities.ChunkEntity;
}) {
  let chunk = item.chunk;

  let content: interfaces.ChunkContentParsed = JSON.parse(chunk.content);

  // get projects with members

  let projectIds = [
    ...content.dashboards,
    ...content.errors,
    ...content.files,
    ...content.mconfigs,
    ...content.members,
    ...content.models,
    ...content.projects,
    ...content.queries,
    ...content.projects,
    ...content.queries,
    ...content.repos
  ].map(x => x.project_id);

  // let storeProjects = store.getProjectsRepo();

  // let projectIdMemberIdList = await storeProjects
  //   .createQueryBuilder('project')
  //   .leftJoinAndMapMany(
  //     'project.members',
  //     MemberEntity,
  //     'member',
  //     'member.project_id = project.project_id'
  //   )
  //   .getMany();

  let projectMembersMap: interfaces.ProjectMembersMap = {};

  if (projectIds.length > 0) {
    let storeMembers = store.getMembersRepo();

    let memberIdProjectIdPairs = await storeMembers.find({
      select: ['member_id', 'project_id'],
      where: {
        project_id: In(projectIds)
      }
    });

    memberIdProjectIdPairs.forEach(x => {
      if (projectMembersMap[x.project_id]) {
        projectMembersMap[x.project_id].push(x.member_id);
      } else {
        projectMembersMap[x.project_id] = [x.member_id];
      }
    });
  }

  await forEach(item.ws_clients_open, async wsClient => {
    let payload: api.UpdateStateRequestBody['payload'] = {
      user: null,
      projects: [],
      repos: [],
      files: [],
      queries: [],
      models: [],
      mconfigs: [],
      dashboards: [],
      errors: [],
      members: []
    };

    // let isSameUser = chunk.source_user_id && chunk.source_user_id === wsClient.user_id;
    let isSameSession =
      chunk.source_session_id &&
      chunk.source_session_id === wsClient.session_id;
    let isDifferentSession = !isSameSession;

    // users

    content.users.forEach(user => {
      if (isDifferentSession && user.user_id === wsClient.user_id) {
        let newUser = wrapper.wrapToApiUser(user);

        if (payload.user) {
          // in case if chunk has several changes about same user_id, should not be

          if (payload.user.server_ts < newUser.server_ts) {
            payload.user = newUser;
          }
        } else {
          payload.user = newUser;
        }
      }
    });

    // projects

    await forEach(content.projects, async project => {
      if (isDifferentSession) {
        let projectMemberIds = projectMembersMap[project.project_id];

        if (
          projectMemberIds &&
          projectMemberIds.indexOf(wsClient.user_id) > -1
        ) {
          let wrappedProject = wrapper.wrapToApiProject(project);
          payload.projects.push(wrappedProject);
        }
      }
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    // repos

    await forEach(content.repos, async repo => {
      if (isDifferentSession) {
        if (repo.repo_id === constants.PROD_REPO_ID) {
          let projectMemberIds = projectMembersMap[repo.project_id];

          if (
            projectMemberIds &&
            projectMemberIds.indexOf(wsClient.user_id) > -1
          ) {
            // prod repo
            let wrappedRepo = wrapper.wrapToApiRepo(repo);
            payload.repos.push(wrappedRepo);
          }
        } else if (repo.repo_id === wsClient.user_id) {
          // user dev repo
          let wrappedRepo = wrapper.wrapToApiRepo(repo);
          payload.repos.push(wrappedRepo);
        } else {
          // other user dev repo - ok
        }
      }
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    // files

    await forEach(content.files, async file => {
      if (isDifferentSession) {
        if (file.repo_id === constants.PROD_REPO_ID) {
          // file of prod repo
          let projectMemberIds = projectMembersMap[file.project_id];

          if (
            projectMemberIds &&
            projectMemberIds.indexOf(wsClient.user_id) > -1
          ) {
            let wrappedFile = wrapper.wrapToApiFile(file);
            payload.files.push(wrappedFile);
          }
        } else if (file.repo_id === wsClient.user_id) {
          // file of user dev repo
          let wrappedFile = wrapper.wrapToApiFile(file);
          payload.files.push(wrappedFile);
        } else {
          // file of other user dev repo - ok
        }
      }
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    // queries

    await forEach(content.queries, async query => {
      let wrappedQuery = wrapper.wrapToApiQuery(query);
      payload.queries.push(wrappedQuery);
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    // models

    await forEach(content.models, async model => {
      if (isDifferentSession) {
        if (model.repo_id === constants.PROD_REPO_ID) {
          let projectMemberIds = projectMembersMap[model.project_id];

          if (
            projectMemberIds &&
            projectMemberIds.indexOf(wsClient.user_id) > -1
          ) {
            // model of prod repo && user is member
            let wrappedModel = wrapper.wrapToApiModel(model);
            payload.models.push(wrappedModel);
          }
        } else if (model.repo_id === wsClient.user_id) {
          // model of user dev repo
          let wrappedModel = wrapper.wrapToApiModel(model);
          payload.models.push(wrappedModel);
        } else {
          // model of other user dev repo - ok
        }
      }
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    // dashboards

    await forEach(content.dashboards, async dashboard => {
      if (isDifferentSession) {
        if (dashboard.repo_id === constants.PROD_REPO_ID) {
          let projectMemberIds = projectMembersMap[dashboard.project_id];

          if (
            projectMemberIds &&
            projectMemberIds.indexOf(wsClient.user_id) > -1
          ) {
            // dashboard of prod repo && user is member
            let wrappedDashboard = wrapper.wrapToApiDashboard(dashboard);
            payload.dashboards.push(wrappedDashboard);
          }
        } else if (dashboard.repo_id === wsClient.user_id) {
          // dashboard of user dev repo
          let wrappedDashboard = wrapper.wrapToApiDashboard(dashboard);
          payload.dashboards.push(wrappedDashboard);
        } else {
          // dashboard of other user dev repo - ok
        }
      }
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    // mconfigs

    await forEach(content.mconfigs, async mconfig => {
      if (isDifferentSession) {
        if (mconfig.repo_id === constants.PROD_REPO_ID) {
          let projectMemberIds = projectMembersMap[mconfig.project_id];

          if (
            projectMemberIds &&
            projectMemberIds.indexOf(wsClient.user_id) > -1
          ) {
            // mconfig of prod repo && user is member
            let wrappedMconfig = wrapper.wrapToApiMconfig(mconfig);
            payload.mconfigs.push(wrappedMconfig);
          }
        } else if (mconfig.repo_id === wsClient.user_id) {
          // mconfig of user dev repo
          let wrappedMconfig = wrapper.wrapToApiMconfig(mconfig);
          payload.mconfigs.push(wrappedMconfig);
        } else {
          // mconfig of other user dev repo - ok
        }
      }
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    // errors

    await forEach(content.errors, async error => {
      if (isDifferentSession) {
        if (error.repo_id === constants.PROD_REPO_ID) {
          let projectMemberIds = projectMembersMap[error.project_id];

          if (
            projectMemberIds &&
            projectMemberIds.indexOf(wsClient.user_id) > -1
          ) {
            // error of prod repo && user is member
            let wrappedError = wrapper.wrapToApiError(error);
            payload.errors.push(wrappedError);
          }
        } else if (error.repo_id === wsClient.user_id) {
          // error of user dev repo
          let wrappedError = wrapper.wrapToApiError(error);
          payload.errors.push(wrappedError);
        } else {
          // error of other user dev repo - ok
        }
      }
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    // members

    await forEach(content.members, async member => {
      if (isDifferentSession) {
        let projectMemberIds = projectMembersMap[member.project_id];

        if (
          projectMemberIds &&
          projectMemberIds.indexOf(wsClient.user_id) > -1
        ) {
          let wrappedMember = wrapper.wrapToApiMember(member);
          payload.members.push(wrappedMember);
        }
      }
    }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));

    //

    if (
      payload.user ||
      payload.projects.length > 0 ||
      payload.repos.length > 0 ||
      payload.files.length > 0 ||
      payload.queries.length > 0 ||
      payload.models.length > 0 ||
      payload.mconfigs.length > 0 ||
      payload.dashboards.length > 0 ||
      payload.errors.length > 0 ||
      payload.members.length > 0
    ) {
      await createMessage({
        payload: payload,
        ws_client: wsClient,
        chunk_id: chunk.chunk_id,
        chunk_server_ts: chunk.server_ts,
        action: api.ServerRequestToClientActionEnum.StateUpdate
      }).catch(e =>
        helper.reThrow(e, enums.procErrorsEnum.PROC_SPLIT_CHUNK_CREATE_MESSAGE)
      );
    }

    let newChunkSession = generator.makeChunkSession({
      chunk_id: item.chunk.chunk_id,
      session_id: wsClient.session_id
    });

    let storeChunkSessions = store.getChunkSessionsRepo();

    await storeChunkSessions
      .insert(newChunkSession)
      .catch(e =>
        helper.reThrow(e, enums.storeErrorsEnum.CHUNK_SESSION_INSERT)
      );
  }).catch(e => helper.reThrow(e, enums.otherErrorsEnum.FOR_EACH));
}

async function createMessage(item: {
  payload: any;
  ws_client: interfaces.WebsocketClient;
  chunk_id: string;
  chunk_server_ts: string;
  action: api.ServerRequestToClientActionEnum;
}) {
  let messageId = helper.makeId();

  let content = wrapper.wrapWebsocketMessage({
    message_id: messageId,
    payload: item.payload,
    session_id: item.ws_client.session_id,
    action: item.action
  });

  let isSent = enums.bEnum.FALSE;

  helper
    .sendWsAsync({
      ws_client: item.ws_client,
      content: content
    })
    .then(() => {
      isSent = enums.bEnum.TRUE;
    })
    .catch(e => {
      try {
        helper.reThrow(e, enums.helperErrorsEnum.HELPER_SEND_WS_ASYNC);
      } catch (err) {
        handler.errorToLog(err);
      }
    })
    .then(() => {
      let message = generator.makeMessage({
        message_id: messageId,
        content: content,
        session_id: item.ws_client.session_id,
        chunk_id: item.chunk_id,
        chunk_server_ts: item.chunk_server_ts,
        last_send_attempt_ts: helper.makeTs(),
        is_sent: isSent
      });

      let storeMessages = store.getMessagesRepo();

      storeMessages
        .insert(message)
        .catch(err =>
          helper.reThrow(err, enums.storeErrorsEnum.STORE_MESSAGES_INSERT)
        );
    });
}
