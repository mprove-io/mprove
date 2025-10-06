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
import { BranchEnt } from '~backend/drizzle/postgres/schema/branches';
import { BridgeEnt } from '~backend/drizzle/postgres/schema/bridges';
import { ChartEnt } from '~backend/drizzle/postgres/schema/charts';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { DashboardEnt } from '~backend/drizzle/postgres/schema/dashboards';
import { EnvEnt } from '~backend/drizzle/postgres/schema/envs';
import { MconfigEnt } from '~backend/drizzle/postgres/schema/mconfigs';
import { MemberEnt } from '~backend/drizzle/postgres/schema/members';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { OrgEnt } from '~backend/drizzle/postgres/schema/orgs';
import { ProjectEnt } from '~backend/drizzle/postgres/schema/projects';
import { QueryEnt } from '~backend/drizzle/postgres/schema/queries';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { StructEnt } from '~backend/drizzle/postgres/schema/structs';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeRoutingKeyToDisk } from '~backend/functions/make-routing-key-to-disk';
import { makeTsUsingOffsetFromNow } from '~backend/functions/make-ts-using-offset-from-now';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BlockmlService } from '~backend/services/blockml.service';
import { EntMakerService } from '~backend/services/maker.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { TabService } from '~backend/services/tab.service';
import { UsersService } from '~backend/services/users.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';
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
import { Project } from '~common/interfaces/backend/project';
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
    private tabService: TabService,
    private rabbitService: RabbitService,
    private usersService: UsersService,
    private blockmlService: BlockmlService,
    private entMakerService: EntMakerService,
    private wrapToApiService: WrapToApiService,
    private wrapToEntService: WrapToEntService,
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

    let users: UserEnt[] = [];
    let orgs: OrgEnt[] = [];
    let projects: ProjectEnt[] = [];
    let envs: EnvEnt[] = [];
    let members: MemberEnt[] = [];
    let connections: ConnectionEnt[] = [];
    let structs: StructEnt[] = [];
    let branches: BranchEnt[] = [];
    let bridges: BridgeEnt[] = [];
    let charts: ChartEnt[] = [];
    let queries: QueryEnt[] = [];
    let models: ModelEnt[] = [];
    let reports: ReportEnt[] = [];
    let mconfigs: MconfigEnt[] = [];
    let dashboards: DashboardEnt[] = [];

    if (isDefined(payloadUsers)) {
      await asyncPool(
        1,
        payloadUsers,
        async (x: ToBackendSeedRecordsRequestPayloadUsersItem) => {
          let alias = await this.usersService.makeAlias(x.email);
          let { salt, hash } = isDefined(x.password)
            ? await this.usersService.makeSaltAndHash(x.password)
            : { salt: undefined, hash: undefined };

          let newUser: UserEnt = {
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
            hash: hash,
            salt: salt,
            jwtMinIat: undefined,
            firstName: undefined,
            lastName: undefined,
            ui: makeCopy(DEFAULT_SRV_UI),
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
          let newOrg: OrgEnt = {
            orgId: x.orgId,
            name: x.name,
            ownerEmail: x.ownerEmail,
            ownerId: users.find(u => u.email === x.ownerEmail).userId,
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
        let newConnection = this.entMakerService.makeConnection({
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
        let newEnv = this.entMakerService.makeEnv({
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
          let newProject: Project = {
            orgId: x.orgId,
            projectId: x.projectId || makeId(),
            remoteType: x.remoteType,
            tab: {
              name: x.name,
              defaultBranch: x.defaultBranch,
              gitUrl: x.gitUrl,
              privateKey: x.privateKey,
              publicKey: x.publicKey
            },
            serverTs: undefined
          };

          let prodEnv = this.entMakerService.makeEnv({
            projectId: newProject.projectId,
            envId: PROJECT_ENV_PROD,
            evs: []
          });

          let toDiskSeedProjectRequest: ToDiskSeedProjectRequest = {
            info: {
              name: ToDiskRequestInfoNameEnum.ToDiskSeedProject,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newProject.orgId,
              project: newProject,
              testProjectId: x.testProjectId,
              devRepoId: users[0].userId,
              userAlias: users[0].alias
            }
          };

          let diskResponse =
            await this.rabbitService.sendToDisk<ToDiskSeedProjectResponse>({
              routingKey: makeRoutingKeyToDisk({
                orgId: newProject.orgId,
                projectId: newProject.projectId
              }),
              message: toDiskSeedProjectRequest,
              checkIsOk: true
            });

          let devStructId = makeId();
          let prodStructId = makeId();

          let prodEnvProjectConnections = connections
            .filter(
              y =>
                y.projectId === newProject.projectId &&
                y.envId === prodEnv.envId
            )
            .map(c =>
              this.wrapToApiService.wrapToApiConnection({
                connection: c,
                isIncludePasswords: true
              })
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
            connections: prodEnvProjectConnections,
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
            connections: prodEnvProjectConnections,
            overrideTimezone: undefined,
            evs: prodEnv.evs
          });

          let devBranch = this.entMakerService.makeBranch({
            projectId: newProject.projectId,
            repoId: users[0].userId,
            branchId: newProject.defaultBranch
          });

          let prodBranch = this.entMakerService.makeBranch({
            projectId: newProject.projectId,
            repoId: PROD_REPO_ID,
            branchId: newProject.defaultBranch
          });

          let devBranchBridgeProdEnv = this.entMakerService.makeBridge({
            projectId: devBranch.projectId,
            repoId: devBranch.repoId,
            branchId: devBranch.branchId,
            envId: prodEnv.envId,
            structId: devStructId,
            needValidate: false
          });

          let prodBranchBridgeProdEnv = this.entMakerService.makeBridge({
            projectId: prodBranch.projectId,
            repoId: prodBranch.repoId,
            branchId: prodBranch.branchId,
            envId: prodEnv.envId,
            structId: prodStructId,
            needValidate: false
          });

          let newProjectEnt: ProjectEnt = {
            orgId: newProject.orgId,
            projectId: newProject.projectId,
            name: newProject.name,
            defaultBranch: newProject.defaultBranch,
            remoteType: newProject.remoteType,
            gitUrl: newProject.gitUrl,
            tab: this.tabService.encryptData({ data: newProject.tab }),
            serverTs: newProject.serverTs
          };

          projects.push(newProjectEnt);
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
              this.wrapToEntService.wrapToEntityChart({
                chart: y,
                chartType: devMconfigsApi.find(
                  mconfig => mconfig.mconfigId === y.tiles[0].mconfigId
                ).chart.type
              })
            ),
            ...prodChartsApi.map(y =>
              this.wrapToEntService.wrapToEntityChart({
                chart: y,
                chartType: prodMconfigsApi.find(
                  mconfig => mconfig.mconfigId === y.tiles[0].mconfigId
                ).chart.type
              })
            )
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

          reports = [
            ...reports,
            ...devReportsApi.map(y =>
              this.wrapToEntService.wrapToEntityReport(y)
            ),
            ...prodReportsApi.map(y =>
              this.wrapToEntService.wrapToEntityReport(y)
            )
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

    if (isDefined(payloadMembers)) {
      await asyncPool(
        1,
        payloadMembers,
        async (x: ToBackendSeedRecordsRequestPayloadMembersItem) => {
          let user = users.find(u => u.email === x.email);

          let newMember = this.entMakerService.makeMember({
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

    if (isDefined(payloadQueries)) {
      queries = [
        ...queries,
        ...payloadQueries.map(pq => this.wrapToEntService.wrapToEntityQuery(pq))
      ];
    }

    if (isDefined(payloadMconfigs)) {
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
