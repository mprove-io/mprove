import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { wrapper } from '~backend/barrels/wrapper';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { DbService } from '~backend/services/db.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class SeedRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private usersService: UsersService,
    private blockmlService: BlockmlService,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async seedRecords(@Req() request: any) {
    let reqValid: apiToBackend.ToBackendSeedRecordsRequest = request.body;

    let payloadUsers = reqValid.payload.users;
    let payloadMembers = reqValid.payload.members;
    let payloadOrgs = reqValid.payload.orgs;
    let payloadProjects = reqValid.payload.projects;
    let payloadConnections = reqValid.payload.connections;
    let payloadEnvs = reqValid.payload.envs;
    let payloadEvs = reqValid.payload.evs;
    let payloadQueries = reqValid.payload.queries;
    let payloadMconfigs = reqValid.payload.mconfigs;

    //

    let users: entities.UserEntity[] = [];
    let orgs: entities.OrgEntity[] = [];
    let projects: entities.ProjectEntity[] = [];
    let envs: entities.EnvEntity[] = [];
    let evs: entities.EvEntity[] = [];
    let members: entities.MemberEntity[] = [];
    let connections: entities.ConnectionEntity[] = [];
    let structs: entities.StructEntity[] = [];
    let branches: entities.BranchEntity[] = [];
    let bridges: entities.BridgeEntity[] = [];
    let vizs: entities.VizEntity[] = [];
    let queries: entities.QueryEntity[] = [];
    let models: entities.ModelEntity[] = [];
    let mconfigs: entities.MconfigEntity[] = [];
    let dashboards: entities.DashboardEntity[] = [];

    if (common.isDefined(payloadUsers)) {
      await asyncPool(
        1,
        payloadUsers,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadUsersItem) => {
          let alias = await this.usersService.makeAlias(x.email);
          let { salt, hash } = common.isDefined(x.password)
            ? await this.usersService.makeSaltAndHash(x.password)
            : { salt: undefined, hash: undefined };

          let newUser = maker.makeUser({
            userId: x.userId,
            email: x.email,
            isEmailVerified: x.isEmailVerified,
            emailVerificationToken: x.emailVerificationToken,
            passwordResetToken: x.passwordResetToken,
            hash: hash,
            salt: salt,
            alias: alias,
            passwordResetExpiresTs: common.isDefined(x.passwordResetExpiresTs)
              ? x.passwordResetExpiresTs
              : common.isDefined(x.passwordResetToken)
              ? helper.makeTsUsingOffsetFromNow(
                  constants.PASSWORD_EXPIRES_OFFSET
                )
              : undefined
          });

          users.push(newUser);
        }
      );
    }

    if (common.isDefined(payloadOrgs)) {
      await asyncPool(
        1,
        payloadOrgs,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadOrgsItem) => {
          let newOrg = maker.makeOrg({
            orgId: x.orgId,
            name: x.name,
            ownerEmail: x.ownerEmail,
            ownerId: users.find(u => u.email === x.ownerEmail).user_id
          });

          let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newOrg.org_id
            }
          };

          await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateOrgResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: newOrg.org_id,
                projectId: null
              }),
              message: createOrgRequest,
              checkIsOk: true
            }
          );

          orgs.push(newOrg);
        }
      );
    }

    if (common.isDefined(payloadConnections)) {
      payloadConnections.forEach(x => {
        let newConnection = maker.makeConnection({
          projectId: x.projectId,
          envId: x.envId,
          connectionId: x.connectionId,
          type: x.type,
          host: x.host,
          port: x.port,
          database: x.database,
          username: x.username,
          password: x.password,
          account: x.account,
          warehouse: x.warehouse,
          bigqueryCredentials: x.bigqueryCredentials,
          bigqueryQuerySizeLimitGb: x.bigqueryQuerySizeLimitGb,
          isSSL: x.isSSL
        });

        connections.push(newConnection);
      });
    }

    if (common.isDefined(payloadEnvs)) {
      payloadEnvs.forEach(x => {
        let newEnv = maker.makeEnv({
          projectId: x.projectId,
          envId: x.envId
        });

        envs.push(newEnv);
      });
    }

    if (common.isDefined(payloadEvs)) {
      payloadEvs.forEach(x => {
        let newEv = maker.makeEv({
          projectId: x.projectId,
          envId: x.envId,
          evId: x.evId,
          val: x.val
        });

        evs.push(newEv);
      });
    }

    if (common.isDefined(payloadProjects)) {
      await asyncPool(
        1,
        payloadProjects,
        async (
          x: apiToBackend.ToBackendSeedRecordsRequestPayloadProjectsItem
        ) => {
          let newProject = maker.makeProject({
            orgId: x.orgId,
            projectId: x.projectId || common.makeId(),
            name: x.name,
            defaultBranch: x.defaultBranch,
            remoteType: x.remoteType,
            gitUrl: x.gitUrl,
            privateKey: x.privateKey,
            publicKey: x.publicKey
          });

          let prodEnv = maker.makeEnv({
            projectId: newProject.project_id,
            envId: common.PROJECT_ENV_PROD
          });

          let toDiskSeedProjectRequest: apiToDisk.ToDiskSeedProjectRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newProject.org_id,
              projectId: newProject.project_id,
              projectName: newProject.name,
              testProjectId: x.testProjectId,
              devRepoId: users[0].user_id,
              userAlias: users[0].alias,
              defaultBranch: newProject.default_branch,
              remoteType: newProject.remote_type,
              gitUrl: newProject.git_url,
              privateKey: newProject.private_key,
              publicKey: newProject.public_key
            }
          };

          let diskResponse =
            await this.rabbitService.sendToDisk<apiToDisk.ToDiskSeedProjectResponse>(
              {
                routingKey: helper.makeRoutingKeyToDisk({
                  orgId: newProject.org_id,
                  projectId: newProject.project_id
                }),
                message: toDiskSeedProjectRequest,
                checkIsOk: true
              }
            );

          let devStructId = common.makeId();
          let prodStructId = common.makeId();

          let projectConnections = connections
            .filter(
              z =>
                z.project_id === newProject.project_id &&
                z.env_id === prodEnv.env_id
            )
            .map(c => ({
              connectionId: c.connection_id,
              type: c.type,
              bigqueryProject: c.bigquery_project
            }));

          let {
            struct: devStruct,
            vizs: devVizsApi,
            mconfigs: devMconfigsApi,
            queries: devQueriesApi,
            dashboards: devDashboardsApi,
            models: devModelsApi
          } = await this.blockmlService.rebuildStruct({
            traceId: reqValid.info.traceId,
            orgId: newProject.org_id,
            projectId: newProject.project_id,
            structId: devStructId,
            diskFiles: diskResponse.payload.files,
            mproveDir: diskResponse.payload.mproveDir,
            envId: prodEnv.env_id,
            skipDb: true,
            connections: projectConnections,
            evs: evs
              .map(evEntity => wrapper.wrapToApiEv(evEntity))
              .filter(ev => ev.envId === prodEnv.env_id)
          });

          let {
            struct: prodStruct,
            vizs: prodVizsApi,
            mconfigs: prodMconfigsApi,
            queries: prodQueriesApi,
            dashboards: prodDashboardsApi,
            models: prodModelsApi
          } = await this.blockmlService.rebuildStruct({
            traceId: reqValid.info.traceId,
            orgId: newProject.org_id,
            projectId: newProject.project_id,
            structId: prodStructId,
            diskFiles: diskResponse.payload.files,
            mproveDir: diskResponse.payload.mproveDir,
            envId: prodEnv.env_id,
            skipDb: true,
            connections: projectConnections,
            evs: evs
              .map(evEntity => wrapper.wrapToApiEv(evEntity))
              .filter(ev => ev.envId === prodEnv.env_id)
          });

          let devBranch = maker.makeBranch({
            projectId: newProject.project_id,
            repoId: users[0].user_id,
            branchId: newProject.default_branch
          });

          let prodBranch = maker.makeBranch({
            projectId: newProject.project_id,
            repoId: common.PROD_REPO_ID,
            branchId: newProject.default_branch
          });

          let devBranchBridgeProdEnv = maker.makeBridge({
            projectId: devBranch.project_id,
            repoId: devBranch.repo_id,
            branchId: devBranch.branch_id,
            envId: prodEnv.env_id,
            structId: devStructId,
            needValidate: common.BoolEnum.FALSE
          });

          let prodBranchBridgeProdEnv = maker.makeBridge({
            projectId: prodBranch.project_id,
            repoId: prodBranch.repo_id,
            branchId: prodBranch.branch_id,
            envId: prodEnv.env_id,
            structId: prodStructId,
            needValidate: common.BoolEnum.FALSE
          });

          projects.push(newProject);
          envs.push(prodEnv);

          structs = [...structs, devStruct, prodStruct];

          branches = [...branches, devBranch, prodBranch];

          bridges = [
            ...bridges,
            devBranchBridgeProdEnv,
            prodBranchBridgeProdEnv
          ];

          vizs = [
            ...vizs,
            ...devVizsApi.map(z => wrapper.wrapToEntityViz(z)),
            ...prodVizsApi.map(z => wrapper.wrapToEntityViz(z))
          ];

          models = [
            ...models,
            ...devModelsApi.map(z => wrapper.wrapToEntityModel(z)),
            ...prodModelsApi.map(z => wrapper.wrapToEntityModel(z))
          ];

          queries = [
            ...queries,
            ...devQueriesApi.map(z => wrapper.wrapToEntityQuery(z)),
            ...prodQueriesApi.map(z => wrapper.wrapToEntityQuery(z))
          ];

          dashboards = [
            ...dashboards,
            ...devDashboardsApi.map(z => wrapper.wrapToEntityDashboard(z)),
            ...prodDashboardsApi.map(z => wrapper.wrapToEntityDashboard(z))
          ];

          mconfigs = [
            ...mconfigs,
            ...devMconfigsApi.map(z => wrapper.wrapToEntityMconfig(z)),
            ...prodMconfigsApi.map(z => wrapper.wrapToEntityMconfig(z))
          ];
        }
      );
    }

    if (common.isDefined(payloadMembers)) {
      await asyncPool(
        1,
        payloadMembers,
        async (
          x: apiToBackend.ToBackendSeedRecordsRequestPayloadMembersItem
        ) => {
          let user = users.find(u => u.email === x.email);

          let newMember = maker.makeMember({
            projectId: x.projectId,
            user: user,
            roles: x.roles,
            envs: x.envs,
            isAdmin: x.isAdmin,
            isEditor: x.isEditor,
            isExplorer: x.isExplorer
          });

          members.push(newMember);
        }
      );
    }

    if (common.isDefined(payloadQueries)) {
      queries = [
        ...queries,
        ...payloadQueries.map(pq => wrapper.wrapToEntityQuery(pq))
      ];
    }

    if (common.isDefined(payloadMconfigs)) {
      mconfigs = [
        ...mconfigs,
        ...payloadMconfigs.map(mc => wrapper.wrapToEntityMconfig(mc))
      ];
    }

    await this.dbService.writeRecords({
      modify: false,
      records: {
        users: users,
        orgs: orgs,
        projects: projects,
        envs: envs,
        evs: evs,
        members: members,
        connections: connections,
        branches: branches,
        bridges: bridges,
        structs: structs,
        vizs: vizs,
        queries: queries,
        models: models,
        mconfigs: mconfigs,
        dashboards: dashboards
      }
    });

    let payload: apiToBackend.ToBackendSeedRecordsResponse['payload'] = {};

    return payload;
  }
}
