import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SkipThrottle } from '@nestjs/throttler';
import asyncPool from 'tiny-async-pool';
import { BackendConfig } from '~backend/config/backend-config';
import { SkipJwtCheck } from '~backend/decorators/skip-jwt-check.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  BranchTab,
  BridgeTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
  EnvTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  OrgTab,
  ProjectTab,
  QueryTab,
  ReportTab,
  StructTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { makeTsUsingOffsetFromNow } from '~backend/functions/make-ts-using-offset-from-now';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { ChartsService } from '~backend/services/db/charts.service';
import { ConnectionsService } from '~backend/services/db/connections.service';
import { DashboardsService } from '~backend/services/db/dashboards.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { OrgsService } from '~backend/services/db/orgs.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { ReportsService } from '~backend/services/db/reports.service';
import { UsersService } from '~backend/services/db/users.service';
import { HashService } from '~backend/services/hash.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { PROD_REPO_ID, PROJECT_ENV_PROD } from '~common/constants/top';
import {
  DEFAULT_SRV_UI,
  PASSWORD_EXPIRES_OFFSET
} from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '~common/enums/to/to-disk-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { makeCopy } from '~common/functions/make-copy';
import { makeId } from '~common/functions/make-id';
import { BaseProject } from '~common/interfaces/backend/base-project';
import {
  ToBackendSeedRecordsRequest,
  ToBackendSeedRecordsRequestPayloadMembersItem,
  ToBackendSeedRecordsRequestPayloadOrgsItem,
  ToBackendSeedRecordsRequestPayloadProjectsItem,
  ToBackendSeedRecordsRequestPayloadUsersItem,
  ToBackendSeedRecordsResponse
} from '~common/interfaces/to-backend/test-routes/to-backend-seed-records';
import {
  ToDiskCreateOrgRequest,
  ToDiskCreateOrgResponse
} from '~common/interfaces/to-disk/01-orgs/to-disk-create-org';
import {
  ToDiskSeedProjectRequest,
  ToDiskSeedProjectResponse
} from '~common/interfaces/to-disk/08-seed/to-disk-seed-project';

let retry = require('async-retry');

@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard, ValidateRequestGuard)
@Controller()
export class SeedRecordsController {
  constructor(
    private hashService: HashService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private rabbitService: RabbitService,
    private usersService: UsersService,
    private connectionsService: ConnectionsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private chartsService: ChartsService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private orgsService: OrgsService,
    private projectsService: ProjectsService,
    private queriesService: QueriesService,
    private reportsService: ReportsService,
    private dashboardsService: DashboardsService,
    private blockmlService: BlockmlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async seedRecords(@Req() request: any) {
    let reqValid: ToBackendSeedRecordsRequest = request.body;

    let payloadUsers = reqValid.payload.users;
    let payloadMembers = reqValid.payload.members;
    let payloadOrgs = reqValid.payload.orgs;
    let payloadProjects = reqValid.payload.projects;
    let payloadConnections = reqValid.payload.connections;
    let payloadEnvs = reqValid.payload.envs;
    let payloadQueries = reqValid.payload.queries;
    let payloadMconfigs = reqValid.payload.mconfigs;

    //

    // let avatars = ...
    let branches: BranchTab[] = [];
    let bridges: BridgeTab[] = [];
    let charts: ChartTab[] = [];
    let connections: ConnectionTab[] = [];
    let dashboards: DashboardTab[] = [];
    let envs: EnvTab[] = [];
    // let kits = ...
    let mconfigs: MconfigTab[] = [];
    let members: MemberTab[] = [];
    let models: ModelTab[] = [];
    // let notes = ...
    let orgs: OrgTab[] = [];
    let projects: ProjectTab[] = [];
    let queries: QueryTab[] = [];
    let reports: ReportTab[] = [];
    let structs: StructTab[] = [];
    let users: UserTab[] = [];

    if (isDefined(payloadUsers)) {
      await asyncPool(
        1,
        payloadUsers,
        async (x: ToBackendSeedRecordsRequestPayloadUsersItem) => {
          let alias = await this.usersService.makeAlias(x.email);

          let passwordHS = isDefined(x.password)
            ? await this.hashService.createSaltAndHash(x.password)
            : { salt: undefined, hash: undefined };

          let newUser: UserTab = {
            userId: x.userId || makeId(),
            email: x.email,
            alias: alias,
            isEmailVerified: x.isEmailVerified,
            emailVerificationToken: x.emailVerificationToken || makeId(),
            passwordResetToken: x.passwordResetToken,
            passwordResetExpiresTs: isDefined(x.passwordResetExpiresTs)
              ? x.passwordResetExpiresTs
              : isDefined(x.passwordResetToken)
                ? makeTsUsingOffsetFromNow(PASSWORD_EXPIRES_OFFSET)
                : undefined,
            passwordHash: passwordHS.hash,
            passwordSalt: passwordHS.salt,
            jwtMinIat: undefined,
            firstName: undefined,
            lastName: undefined,
            ui: makeCopy(DEFAULT_SRV_UI),
            emailHash: undefined, // tab-to-ent
            aliasHash: undefined, // tab-to-ent
            emailVerificationTokenHash: undefined, // tab-to-ent
            passwordResetTokenHash: undefined, // tab-to-ent
            serverTs: undefined
          };

          users.push(newUser);
        }
      );
    }

    if (isDefined(payloadOrgs)) {
      await asyncPool(
        1,
        payloadOrgs,
        async (x: ToBackendSeedRecordsRequestPayloadOrgsItem) => {
          let newOrg: OrgTab = {
            orgId: x.orgId,
            name: x.name,
            ownerEmail: x.ownerEmail,
            ownerId: users.find(u => u.email === x.ownerEmail).userId,
            nameHash: undefined, // tab-to-ent
            ownerEmailHash: undefined, // tab-to-ent
            serverTs: undefined
          };

          let createOrgRequest: ToDiskCreateOrgRequest = {
            info: {
              name: ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newOrg.orgId
            }
          };

          await this.rabbitService.sendToDisk<ToDiskCreateOrgResponse>({
            routingKey: makeRoutingKeyToDisk({
              orgId: newOrg.orgId,
              projectId: null
            }),
            message: createOrgRequest,
            checkIsOk: true
          });

          orgs.push(newOrg);
        }
      );
    }

    if (isDefined(payloadConnections)) {
      payloadConnections.forEach(x => {
        let newConnection = this.connectionsService.makeConnection({
          projectId: x.projectId,
          envId: x.envId,
          connectionId: x.connectionId,
          type: x.type,
          options: x.options
        });

        connections.push(newConnection);
      });
    }

    if (isDefined(payloadEnvs)) {
      payloadEnvs.forEach(x => {
        let newEnv = this.envsService.makeEnv({
          projectId: x.projectId,
          envId: x.envId,
          evs: x.evs
        });

        envs.push(newEnv);
      });
    }

    if (isDefined(payloadProjects)) {
      await asyncPool(
        1,
        payloadProjects,
        async (x: ToBackendSeedRecordsRequestPayloadProjectsItem) => {
          let newProject: ProjectTab = {
            orgId: x.orgId,
            projectId: x.projectId || makeId(),
            remoteType: x.remoteType,
            name: x.name,
            defaultBranch: x.defaultBranch,
            gitUrl: x.gitUrl,
            privateKey: x.privateKey,
            publicKey: x.publicKey,
            nameHash: undefined, // tab-to-ent
            gitUrlHash: undefined, // tab-to-ent
            serverTs: undefined
          };

          let baseProject: BaseProject = this.projectsService.tabToBaseProject({
            project: newProject
          });

          let prodEnv = this.envsService.makeEnv({
            projectId: baseProject.projectId,
            envId: PROJECT_ENV_PROD,
            evs: []
          });

          let toDiskSeedProjectRequest: ToDiskSeedProjectRequest = {
            info: {
              name: ToDiskRequestInfoNameEnum.ToDiskSeedProject,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: baseProject.orgId,
              baseProject: baseProject,
              testProjectId: x.testProjectId,
              devRepoId: users[0].userId,
              userAlias: users[0].alias
            }
          };

          let diskResponse =
            await this.rabbitService.sendToDisk<ToDiskSeedProjectResponse>({
              routingKey: makeRoutingKeyToDisk({
                orgId: baseProject.orgId,
                projectId: baseProject.projectId
              }),
              message: toDiskSeedProjectRequest,
              checkIsOk: true
            });

          let devStructId = makeId();
          let prodStructId = makeId();

          let prodEnvConnections = connections.filter(
            y =>
              y.projectId === newProject.projectId && y.envId === prodEnv.envId
          );

          let {
            struct: devStruct,
            models: devModelsApi,
            reports: devReportsApi,
            dashboards: devDashboardsApi,
            charts: devChartsApi,
            metrics: devMetricsApi,
            mconfigs: devMconfigsApi,
            queries: devQueriesApi
          } = await this.blockmlService.rebuildStruct({
            traceId: reqValid.info.traceId,
            projectId: newProject.projectId,
            structId: devStructId,
            diskFiles: diskResponse.payload.files,
            mproveDir: diskResponse.payload.mproveDir,
            envId: prodEnv.envId,
            skipDb: true,
            connections: prodEnvConnections,
            overrideTimezone: undefined,
            evs: prodEnv.evs
          });

          let {
            struct: prodStruct,
            models: prodModelsApi,
            reports: prodReportsApi,
            dashboards: prodDashboardsApi,
            charts: prodChartsApi,
            metrics: prodMetricsApi,
            mconfigs: prodMconfigsApi,
            queries: prodQueriesApi
          } = await this.blockmlService.rebuildStruct({
            traceId: reqValid.info.traceId,
            projectId: newProject.projectId,
            structId: prodStructId,
            diskFiles: diskResponse.payload.files,
            mproveDir: diskResponse.payload.mproveDir,
            envId: prodEnv.envId,
            skipDb: true,
            connections: prodEnvConnections,
            overrideTimezone: undefined,
            evs: prodEnv.evs
          });

          let devBranch = this.branchesService.makeBranch({
            projectId: newProject.projectId,
            repoId: users[0].userId,
            branchId: newProject.defaultBranch
          });

          let prodBranch = this.branchesService.makeBranch({
            projectId: newProject.projectId,
            repoId: PROD_REPO_ID,
            branchId: newProject.defaultBranch
          });

          let devBranchBridgeProdEnv = this.bridgesService.makeBridge({
            projectId: devBranch.projectId,
            repoId: devBranch.repoId,
            branchId: devBranch.branchId,
            envId: prodEnv.envId,
            structId: devStructId,
            needValidate: false
          });

          let prodBranchBridgeProdEnv = this.bridgesService.makeBridge({
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

          charts = [
            ...charts,
            ...devChartsApi.map(y =>
              this.chartsService.apiToTab({
                apiChart: y,
                chartType: devMconfigsApi.find(
                  mconfig => mconfig.mconfigId === y.tiles[0].mconfigId
                ).chart.type
              })
            ),
            ...prodChartsApi.map(y =>
              this.chartsService.apiToTab({
                apiChart: y,
                chartType: prodMconfigsApi.find(
                  mconfig => mconfig.mconfigId === y.tiles[0].mconfigId
                ).chart.type
              })
            )
          ];

          models = [
            ...models,
            ...devModelsApi.map(y =>
              this.modelsService.apiToTab({ apiModel: y })
            ),
            ...prodModelsApi.map(y =>
              this.modelsService.apiToTab({ apiModel: y })
            )
          ];

          reports = [
            ...reports,
            ...devReportsApi.map(y =>
              this.reportsService.apiToTab({ apiReport: y })
            ),
            ...prodReportsApi.map(y =>
              this.reportsService.apiToTab({ apiReport: y })
            )
          ];

          queries = [
            ...queries,
            ...devQueriesApi.map(y =>
              this.queriesService.apiToTab({ apiQuery: y })
            ),
            ...prodQueriesApi.map(y =>
              this.queriesService.apiToTab({ apiQuery: y })
            )
          ];

          dashboards = [
            ...dashboards,
            ...devDashboardsApi.map(y =>
              this.dashboardsService.apiToTab({ apiDashboard: y })
            ),
            ...prodDashboardsApi.map(y =>
              this.dashboardsService.apiToTab({ apiDashboard: y })
            )
          ];

          mconfigs = [
            ...mconfigs,
            ...devMconfigsApi.map(y =>
              this.mconfigsService.apiToTab({ apiMconfig: y })
            ),
            ...prodMconfigsApi.map(y =>
              this.mconfigsService.apiToTab({ apiMconfig: y })
            )
          ];
        }
      );
    }

    if (isDefined(payloadMembers)) {
      await asyncPool(
        1,
        payloadMembers,
        async (x: ToBackendSeedRecordsRequestPayloadMembersItem) => {
          let user = users.find(u => u.email === x.email);

          let newMember = this.membersService.makeMember({
            projectId: x.projectId,
            user: user,
            roles: x.roles,
            isAdmin: x.isAdmin,
            isEditor: x.isEditor,
            isExplorer: x.isExplorer
          });

          members.push(newMember);
        }
      );
    }

    if (isDefined(payloadQueries)) {
      queries = [
        ...queries,
        ...payloadQueries.map(pq =>
          this.queriesService.apiToTab({ apiQuery: pq })
        )
      ];
    }

    if (isDefined(payloadMconfigs)) {
      mconfigs = [
        ...mconfigs,
        ...payloadMconfigs.map(mc =>
          this.mconfigsService.apiToTab({ apiMconfig: mc })
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
                members: members,
                connections: connections,
                branches: branches,
                bridges: bridges,
                structs: structs,
                charts: charts,
                models: models,
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

    let payload: ToBackendSeedRecordsResponse['payload'] = {};

    return payload;
  }
}
