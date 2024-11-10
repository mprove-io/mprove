import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import asyncPool from 'tiny-async-pool';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { SkipJwtCheck } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { MakerService } from '~backend/services/maker.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@UseGuards(ValidateRequestGuard)
@Controller()
export class SeedRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private usersService: UsersService,
    private blockmlService: BlockmlService,
    private makerService: MakerService,
    private wrapToApiService: WrapToApiService,
    private wrapToEntService: WrapToEntService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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

    let users: schemaPostgres.UserEnt[] = [];
    let orgs: schemaPostgres.OrgEnt[] = [];
    let projects: schemaPostgres.ProjectEnt[] = [];
    let envs: schemaPostgres.EnvEnt[] = [];
    let evs: schemaPostgres.EvEnt[] = [];
    let members: schemaPostgres.MemberEnt[] = [];
    let connections: schemaPostgres.ConnectionEnt[] = [];
    let structs: schemaPostgres.StructEnt[] = [];
    let branches: schemaPostgres.BranchEnt[] = [];
    let bridges: schemaPostgres.BridgeEnt[] = [];
    let vizs: schemaPostgres.VizEnt[] = [];
    let queries: schemaPostgres.QueryEnt[] = [];
    let models: schemaPostgres.ModelEnt[] = [];
    let metrics: schemaPostgres.MetricEnt[] = [];
    let reports: schemaPostgres.ReportEnt[] = [];
    let mconfigs: schemaPostgres.MconfigEnt[] = [];
    let dashboards: schemaPostgres.DashboardEnt[] = [];

    if (common.isDefined(payloadUsers)) {
      await asyncPool(
        1,
        payloadUsers,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadUsersItem) => {
          let alias = await this.usersService.makeAlias(x.email);
          let { salt, hash } = common.isDefined(x.password)
            ? await this.usersService.makeSaltAndHash(x.password)
            : { salt: undefined, hash: undefined };

          let newUser: schemaPostgres.UserEnt = {
            userId: x.userId,
            email: x.email,
            alias: alias,
            isEmailVerified: common.enumToBoolean(x.isEmailVerified),
            emailVerificationToken: x.emailVerificationToken || common.makeId(),
            passwordResetToken: x.passwordResetToken,
            passwordResetExpiresTs: common.isDefined(x.passwordResetExpiresTs)
              ? x.passwordResetExpiresTs
              : common.isDefined(x.passwordResetToken)
              ? helper.makeTsUsingOffsetFromNow(
                  constants.PASSWORD_EXPIRES_OFFSET
                )
              : undefined,
            hash: hash,
            salt: salt,
            jwtMinIat: undefined,
            firstName: undefined,
            lastName: undefined,
            timezone: common.USE_PROJECT_TIMEZONE_VALUE,
            ui: constants.DEFAULT_UI,
            serverTs: undefined
          };

          // let newUser = maker.makeUser({
          //   userId: x.userId,
          //   email: x.email,
          //   isEmailVerified: x.isEmailVerified,
          //   emailVerificationToken: x.emailVerificationToken,
          //   passwordResetToken: x.passwordResetToken,
          //   hash: hash,
          //   salt: salt,
          //   alias: alias,
          //   passwordResetExpiresTs: common.isDefined(x.passwordResetExpiresTs)
          //     ? x.passwordResetExpiresTs
          //     : common.isDefined(x.passwordResetToken)
          //     ? helper.makeTsUsingOffsetFromNow(
          //         constants.PASSWORD_EXPIRES_OFFSET
          //       )
          //     : undefined
          // });

          users.push(newUser);
        }
      );
    }

    if (common.isDefined(payloadOrgs)) {
      await asyncPool(
        1,
        payloadOrgs,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadOrgsItem) => {
          let newOrg: schemaPostgres.OrgEnt = {
            orgId: x.orgId,
            name: x.name,
            ownerEmail: x.ownerEmail,
            ownerId: users.find(u => u.email === x.ownerEmail).userId,
            serverTs: undefined
          };

          // let newOrg = maker.makeOrg({
          //   orgId: x.orgId,
          //   name: x.name,
          //   ownerEmail: x.ownerEmail,
          //   ownerId: users.find(u => u.email === x.ownerEmail).userId
          // });

          let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newOrg.orgId
            }
          };

          await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateOrgResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: newOrg.orgId,
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
        let newConnection = this.makerService.makeConnection({
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
        let newEnv = this.makerService.makeEnv({
          projectId: x.projectId,
          envId: x.envId
        });

        envs.push(newEnv);
      });
    }

    if (common.isDefined(payloadEvs)) {
      payloadEvs.forEach(x => {
        let newEv = this.makerService.makeEv({
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
          let newProject: schemaPostgres.ProjectEnt = {
            orgId: x.orgId,
            projectId: x.projectId || common.makeId(),
            name: x.name,
            defaultBranch: x.defaultBranch,
            remoteType: x.remoteType,
            gitUrl: x.gitUrl,
            privateKey: x.privateKey,
            publicKey: x.publicKey,
            serverTs: undefined
          };

          // let newProject = maker.makeProject({
          //   orgId: x.orgId,
          //   projectId: x.projectId || common.makeId(),
          //   name: x.name,
          //   defaultBranch: x.defaultBranch,
          //   remoteType: x.remoteType,
          //   gitUrl: x.gitUrl,
          //   privateKey: x.privateKey,
          //   publicKey: x.publicKey
          // });

          let prodEnv = this.makerService.makeEnv({
            projectId: newProject.projectId,
            envId: common.PROJECT_ENV_PROD
          });

          let toDiskSeedProjectRequest: apiToDisk.ToDiskSeedProjectRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSeedProject,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newProject.orgId,
              projectId: newProject.projectId,
              projectName: newProject.name,
              testProjectId: x.testProjectId,
              devRepoId: users[0].userId,
              userAlias: users[0].alias,
              defaultBranch: newProject.defaultBranch,
              remoteType: newProject.remoteType,
              gitUrl: newProject.gitUrl,
              privateKey: newProject.privateKey,
              publicKey: newProject.publicKey
            }
          };

          let diskResponse =
            await this.rabbitService.sendToDisk<apiToDisk.ToDiskSeedProjectResponse>(
              {
                routingKey: helper.makeRoutingKeyToDisk({
                  orgId: newProject.orgId,
                  projectId: newProject.projectId
                }),
                message: toDiskSeedProjectRequest,
                checkIsOk: true
              }
            );

          let devStructId = common.makeId();
          let prodStructId = common.makeId();

          let projectConnections = connections
            .filter(
              y =>
                y.projectId === newProject.projectId &&
                y.envId === prodEnv.envId
            )
            .map(c => ({
              connectionId: c.connectionId,
              type: c.type,
              bigqueryProject: c.bigqueryProject
            }));

          let {
            struct: devStruct,
            vizs: devVizsApi,
            mconfigs: devMconfigsApi,
            queries: devQueriesApi,
            dashboards: devDashboardsApi,
            models: devModelsApi,
            metrics: devMetricsApi,
            reps: devRepsApi,
            apis: devApisApi
          } = await this.blockmlService.rebuildStruct({
            traceId: reqValid.info.traceId,
            orgId: newProject.orgId,
            projectId: newProject.projectId,
            structId: devStructId,
            diskFiles: diskResponse.payload.files,
            mproveDir: diskResponse.payload.mproveDir,
            envId: prodEnv.envId,
            skipDb: true,
            connections: projectConnections,
            evs: evs
              .map(evEntity => this.wrapToApiService.wrapToApiEv(evEntity))
              .filter(ev => ev.envId === prodEnv.envId)
          });

          let {
            struct: prodStruct,
            vizs: prodVizsApi,
            mconfigs: prodMconfigsApi,
            queries: prodQueriesApi,
            dashboards: prodDashboardsApi,
            models: prodModelsApi,
            metrics: prodMetricsApi,
            reps: prodRepsApi,
            apis: prodApisApi
          } = await this.blockmlService.rebuildStruct({
            traceId: reqValid.info.traceId,
            orgId: newProject.orgId,
            projectId: newProject.projectId,
            structId: prodStructId,
            diskFiles: diskResponse.payload.files,
            mproveDir: diskResponse.payload.mproveDir,
            envId: prodEnv.envId,
            skipDb: true,
            connections: projectConnections,
            evs: evs
              .map(evEntity => this.wrapToApiService.wrapToApiEv(evEntity))
              .filter(ev => ev.envId === prodEnv.envId)
          });

          let devBranch = this.makerService.makeBranch({
            projectId: newProject.projectId,
            repoId: users[0].userId,
            branchId: newProject.defaultBranch
          });

          let prodBranch = this.makerService.makeBranch({
            projectId: newProject.projectId,
            repoId: common.PROD_REPO_ID,
            branchId: newProject.defaultBranch
          });

          let devBranchBridgeProdEnv = this.makerService.makeBridge({
            projectId: devBranch.projectId,
            repoId: devBranch.repoId,
            branchId: devBranch.branchId,
            envId: prodEnv.envId,
            structId: devStructId,
            needValidate: false
          });

          let prodBranchBridgeProdEnv = this.makerService.makeBridge({
            projectId: prodBranch.projectId,
            repoId: prodBranch.repoId,
            branchId: prodBranch.branchId,
            envId: prodEnv.envId,
            structId: prodStructId,
            needValidate: false
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
            ...devVizsApi.map(y => this.wrapToEntService.wrapToEntityViz(y)),
            ...prodVizsApi.map(y => this.wrapToEntService.wrapToEntityViz(y))
          ];

          models = [
            ...models,
            ...devModelsApi.map(y =>
              this.wrapToEntService.wrapToEntityModel(y)
            ),
            ...prodModelsApi.map(y =>
              this.wrapToEntService.wrapToEntityModel(y)
            )
          ];

          metrics = [
            ...metrics,
            ...devMetricsApi.map(y =>
              this.wrapToEntService.wrapToEntityMetric(y)
            ),
            ...prodMetricsApi.map(y =>
              this.wrapToEntService.wrapToEntityMetric(y)
            )
          ];

          reports = [
            ...reports,
            ...devRepsApi.map(y => this.wrapToEntService.wrapToEntityReport(y)),
            ...prodRepsApi.map(y => this.wrapToEntService.wrapToEntityReport(y))
          ];

          queries = [
            ...queries,
            ...devQueriesApi.map(y =>
              this.wrapToEntService.wrapToEntityQuery(y)
            ),
            ...prodQueriesApi.map(y =>
              this.wrapToEntService.wrapToEntityQuery(y)
            )
          ];

          dashboards = [
            ...dashboards,
            ...devDashboardsApi.map(y =>
              this.wrapToEntService.wrapToEntityDashboard(y)
            ),
            ...prodDashboardsApi.map(y =>
              this.wrapToEntService.wrapToEntityDashboard(y)
            )
          ];

          mconfigs = [
            ...mconfigs,
            ...devMconfigsApi.map(y =>
              this.wrapToEntService.wrapToEntityMconfig(y)
            ),
            ...prodMconfigsApi.map(y =>
              this.wrapToEntService.wrapToEntityMconfig(y)
            )
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

          let newMember = this.makerService.makeMember({
            projectId: x.projectId,
            user: user,
            roles: x.roles,
            envs: x.envs,
            isAdmin: common.enumToBoolean(x.isAdmin),
            isEditor: common.enumToBoolean(x.isEditor),
            isExplorer: common.enumToBoolean(x.isExplorer)
          });

          members.push(newMember);
        }
      );
    }

    if (common.isDefined(payloadQueries)) {
      queries = [
        ...queries,
        ...payloadQueries.map(pq => this.wrapToEntService.wrapToEntityQuery(pq))
      ];
    }

    if (common.isDefined(payloadMconfigs)) {
      mconfigs = [
        ...mconfigs,
        ...payloadMconfigs.map(mc =>
          this.wrapToEntService.wrapToEntityMconfig(mc)
        )
      ];
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
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
                models: models,
                metrics: metrics,
                reports: reports,
                mconfigs: mconfigs,
                dashboards: dashboards
              },
              insertOrUpdate: {
                queries: queries
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    // await this.dbService.writeRecords({
    //   modify: false,
    //   records: {
    //     users: users,
    //     orgs: orgs,
    //     projects: projects,
    //     envs: envs,
    //     evs: evs,
    //     members: members,
    //     connections: connections,
    //     branches: branches,
    //     bridges: bridges,
    //     structs: structs,
    //     vizs: vizs,
    //     queries: queries,
    //     models: models,
    //     metrics: metrics,
    //     reps: reps,
    //     apis: apis,
    //     mconfigs: mconfigs,
    //     dashboards: dashboards
    //   }
    // });

    let payload: apiToBackend.ToBackendSeedRecordsResponse['payload'] = {};

    return payload;
  }
}
