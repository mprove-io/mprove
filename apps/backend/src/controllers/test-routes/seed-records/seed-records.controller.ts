import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import * as bcrypt from 'bcrypt';
import asyncPool from 'tiny-async-pool';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSeedRecordsRequestDto,
  ToBackendSeedRecordsResponseDto
} from '#backend/controllers/test-routes/seed-records/seed-records.dto';
import { SkipJwtCheck } from '#backend/decorators/skip-jwt-check/skip-jwt-check.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  CachedColumnTab,
  CachedPartTab,
  ChartTab,
  ConnectionTab,
  DashboardTab,
  EnvTab,
  MconfigTab,
  MemberTab,
  ModelFieldLeafTab,
  ModelTab,
  OrgTab,
  ProjectTab,
  ProviderTab,
  QueryTab,
  ReportTab,
  SessionTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import {
  type ParseApiKeyOutput,
  parseApiKey
} from '#backend/functions/api-key/parse-api-key/parse-api-key';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeTsUsingOffsetFromNow } from '#backend/functions/make-ts-using-offset-from-now/make-ts-using-offset-from-now';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { TestRoutesGuard } from '#backend/guards/test-routes/test-routes.guard';
import {
  BlockmlService,
  type RebuildStructOutput
} from '#backend/services/blockml/blockml.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { HashService } from '#backend/services/hash/hash.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { OPENAI_PROVIDER_ID } from '#common/constants/providers';
import {
  BRANCH_MAIN,
  PROD_REPO_ID,
  PROJECT_ENV_PROD
} from '#common/constants/top';
import {
  DEFAULT_SRV_UI,
  PASSWORD_EXPIRES_OFFSET
} from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import { makeId } from '#common/functions/make-id/make-id';
import type { MakeAliasError } from '#common/types/backend/function-errors/make-alias-error';
import type { MakeProviderError } from '#common/types/backend/function-errors/make-provider-error';
import type { ParseApiKeyError } from '#common/types/backend/function-errors/parse-api-key-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { ToBackendSeedRecordsInputCachedColumnsItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-cached-columns-item';
import type { ToBackendSeedRecordsInputCachedPartsItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-cached-parts-item';
import type { ToBackendSeedRecordsInputMembersItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-members-item';
import type { ToBackendSeedRecordsInputModelFieldLeafsItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-model-field-leafs-item';
import type { ToBackendSeedRecordsInputOrgsItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-orgs-item';
import type { ToBackendSeedRecordsInputProjectsItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-projects-item';
import type { ToBackendSeedRecordsInputSessionsItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-sessions-item';
import type { ToBackendSeedRecordsInputUsersItem } from '#common/types/backend/parts/test-routes/to-backend-seed-records-input-users-item';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSeedRecordsOutput } from '#common/types/backend/routes/test-routes/seed-records/seed-records-output';
import type { ToDiskSeedProjectOutput } from '#common/types/disk/routes/seed/seed-project/seed-project-output';
import { customAsyncPool } from '#node-common/functions/custom-async-pool/custom-async-pool';

type SaltAndHash = {
  salt?: string;
  hash?: string;
};

type PrepareSeedPayload = {
  branches: BranchTab[];
  bridges: BridgeTab[];
  cachedColumns: CachedColumnTab[];
  cachedParts: CachedPartTab[];
  charts: ChartTab[];
  connections: ConnectionTab[];
  dashboards: DashboardTab[];
  envs: EnvTab[];
  mconfigs: MconfigTab[];
  members: MemberTab[];
  modelFieldLeafs: ModelFieldLeafTab[];
  models: ModelTab[];
  orgs: OrgTab[];
  projects: ProjectTab[];
  providers: ProviderTab[];
  queries: QueryTab[];
  reports: ReportTab[];
  sessions: SessionTab[];
  structs: StructTab[];
  users: UserTab[];
};

@ApiTags('TestRoutes')
@SkipJwtCheck()
@SkipThrottle()
@UseGuards(TestRoutesGuard)
@Controller()
export class SeedRecordsController {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private rpcService: RpcService,
    private usersService: UsersService,
    private connectionsService: ConnectionsService,
    private providersService: ProvidersService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private chartsService: ChartsService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private projectsService: ProjectsService,
    private queriesService: QueriesService,
    private reportsService: ReportsService,
    private dashboardsService: DashboardsService,
    private blockmlService: BlockmlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendSeedRecords' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SeedRecords',
    description: 'Seed users, orgs, projects and related records for tests'
  })
  @ApiOkResponse({
    type: ToBackendSeedRecordsResponseDto
  })
  async seedRecords(
    @Body() body: ToBackendSeedRecordsRequestDto
  ): Promise<BackendResultForOperation<'seedRecords'>> {
    let prepareSeedPayload: PrepareSeedPayload = {
      branches: [],
      bridges: [],
      cachedColumns: [],
      cachedParts: [],
      charts: [],
      connections: [],
      dashboards: [],
      envs: [],
      mconfigs: [],
      members: [],
      modelFieldLeafs: [],
      models: [],
      orgs: [],
      projects: [],
      providers: [],
      queries: [],
      reports: [],
      sessions: [],
      structs: [],
      users: []
    };

    return Result.pipe(
      Result.succeed({
        payloadUsers: body.input.users,
        payloadMembers: body.input.members,
        payloadOrgs: body.input.orgs,
        payloadProjects: body.input.projects,
        payloadConnections: body.input.connections,
        payloadProviders: body.input.providers,
        payloadEnvs: body.input.envs,
        payloadSessions: body.input.sessions,
        payloadQueries: body.input.queries,
        payloadMconfigs: body.input.mconfigs,
        payloadCachedColumns: body.input.cachedColumns,
        payloadCachedParts: body.input.cachedParts,
        payloadModelFieldLeafs: body.input.modelFieldLeafs,
        traceId: body.traceId,
        prepareSeedPayload: prepareSeedPayload
      }),
      Result.andThrough(async v => {
        if (isDefined(v.payloadUsers)) {
          return customAsyncPool({
            poolSize: 1,
            inputs: v.payloadUsers,
            callback: async (
              x: ToBackendSeedRecordsInputUsersItem
            ): Result.ResultAsync<void, MakeAliasError | ParseApiKeyError> => {
              let aliasResult: Result.Result<string, MakeAliasError> =
                await this.usersService.makeAlias({ email: x.email });

              if (Result.isFailure(aliasResult)) {
                return aliasResult;
              }

              let alias: string = aliasResult.value;

              let passwordHS: SaltAndHash = isDefined(x.password)
                ? await this.hashService.createSaltAndHash({
                    input: x.password
                  })
                : { salt: undefined, hash: undefined };

              let apiKeyPrefix: string;

              let apiKeySecretHash: string;

              let apiKeySalt: string;

              if (isDefined(x.apiKey)) {
                let parseApiKeyOutput: Result.Result<
                  ParseApiKeyOutput,
                  ParseApiKeyError
                > = parseApiKey({ fullKey: x.apiKey });

                if (Result.isFailure(parseApiKeyOutput)) {
                  return parseApiKeyOutput;
                }

                let parsed: ParseApiKeyOutput = parseApiKeyOutput.value;

                apiKeyPrefix = parsed.prefix;

                apiKeySalt = await bcrypt.genSalt();

                apiKeySecretHash = await bcrypt.hash(parsed.secret, apiKeySalt);
              }

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
                apiKeyPrefix: apiKeyPrefix,
                apiKeySecretHash: apiKeySecretHash,
                apiKeySalt: apiKeySalt,
                codexAuthUpdateTs: undefined,
                codexAuthExpiresTs: undefined,
                keyTag: undefined,
                serverTs: undefined,
                createdTs: Date.now()
              };

              v.prepareSeedPayload.users.push(newUser);

              return Result.succeed();
            }
          });
        }

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        if (isDefined(v.payloadSessions)) {
          await asyncPool(
            1,
            v.payloadSessions,
            async (x: ToBackendSeedRecordsInputSessionsItem) => {
              let newSession: SessionTab = {
                sessionId: x.sessionId,
                type: x.type,
                repoId: x.repoId,
                branchId: x.branchId,
                userId: x.userId,
                projectId: x.projectId,
                apiKeyPrefix: x.apiKeyPrefix,
                apiKeySecretHash: x.apiKeySecretHash,
                apiKeySalt: x.apiKeySalt,
                sandboxType: 'E2B',
                providerId: OPENAI_PROVIDER_ID,
                modelId: 'gpt-5.1-codex-mini',
                lastMessageVariant: undefined,
                agent: 'build',
                status: x.status,
                archiveReason: undefined,
                pauseReason: undefined,
                initialBranch: BRANCH_MAIN,
                envId: x.envId,
                initialCommit: undefined,
                sandboxId: undefined,
                sandboxBaseUrl: undefined,
                opencodeSessionId: undefined,
                opencodePassword: undefined,
                firstMessage: 'test',
                createdTs: Date.now(),
                lastActivityTs: Date.now(),
                sandboxStartTs: undefined,
                sandboxEndTs: undefined,
                sandboxInfo: undefined,
                lastFetchEventIndex: undefined,
                reloadRequestedTs: undefined,
                codexAuthUpdateTs: undefined,
                keyTag: undefined,
                serverTs: undefined
              };

              v.prepareSeedPayload.sessions.push(newSession);
            }
          );
        }

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        if (isDefined(v.payloadOrgs)) {
          return customAsyncPool({
            poolSize: 1,
            inputs: v.payloadOrgs,
            callback: async (x: ToBackendSeedRecordsInputOrgsItem) => {
              let newOrg: OrgTab = {
                orgId: x.orgId,
                name: x.name,
                ownerEmail: x.ownerEmail,
                ownerId: v.prepareSeedPayload.users.find(
                  u => u.email === x.ownerEmail
                ).userId,
                nameHash: undefined, // tab-to-ent
                ownerEmailHash: undefined, // tab-to-ent
                keyTag: undefined,
                serverTs: undefined
              };

              let createOrgResult: Result.Result<unknown, SendToDiskError> =
                await this.rpcService.sendToDisk({
                  request: {
                    operation: 'createOrg',
                    traceId: v.traceId,
                    input: {
                      orgId: newOrg.orgId
                    }
                  }
                });

              if (Result.isFailure(createOrgResult)) {
                return createOrgResult;
              }

              v.prepareSeedPayload.orgs.push(newOrg);

              return Result.succeed();
            }
          });
        }

        return Result.succeed();
      }),
      Result.map(v => {
        if (isDefined(v.payloadConnections)) {
          v.payloadConnections.forEach(x => {
            let newConnection: ConnectionTab =
              this.connectionsService.makeConnection({
                projectId: x.projectId,
                envId: x.envId,
                connectionId: x.connectionId,
                type: x.type,
                options: x.options
              });

            newConnection.rawSchema = x.rawSchema;

            v.prepareSeedPayload.connections.push(newConnection);
          });
        }

        return v;
      }),
      Result.andThrough(v => {
        if (isDefined(v.payloadProviders)) {
          return Result.sequence(v.payloadProviders, x => {
            let providerModels: LlmModel[] = x.models.map<LlmModel>(model => ({
              modelId: model.modelId,
              name: model.name,
              isManual: model.isManual,
              catalogName: model.name,
              providerModelInfo: model.providerModelInfo,
              contextLimit: model.contextLimit,
              inputLimit: model.inputLimit,
              outputLimit: model.outputLimit,
              variants: [
                {
                  variant: LLM_MODEL_DEFAULT_VARIANT,
                  isExplorer: model.isExplorer,
                  isBuilder: model.isBuilder,
                  isExplorerRecommended: model.isExplorerRecommended ?? false,
                  isBuilderRecommended: model.isBuilderRecommended ?? false
                }
              ],
              isOpencodeSupported: true,
              isExplorer: model.isExplorer,
              isBuilder: model.isBuilder,
              refreshedTs: Date.now()
            }));

            let newProviderResult: Result.Result<
              ProviderTab,
              MakeProviderError
            > = this.providersService.makeProvider({
              ...x,
              models: providerModels
            });

            if (Result.isFailure(newProviderResult)) {
              return newProviderResult;
            }

            v.prepareSeedPayload.providers.push(newProviderResult.value);

            return Result.succeed();
          });
        }

        return Result.succeed();
      }),
      Result.map(v => {
        if (isDefined(v.payloadEnvs)) {
          v.payloadEnvs.forEach(x => {
            let newEnv: EnvTab = this.envsService.makeEnv({
              projectId: x.projectId,
              envId: x.envId,
              evs: x.evs
            });

            v.prepareSeedPayload.envs.push(newEnv);
          });
        }

        return v;
      }),
      Result.andThrough(async v => {
        if (isDefined(v.payloadProjects)) {
          return customAsyncPool({
            poolSize: 1,
            inputs: v.payloadProjects,
            callback: async (
              x: ToBackendSeedRecordsInputProjectsItem
            ): Result.ResultAsync<
              void,
              SendToDiskError | RebuildStructError
            > => {
              let newProject: ProjectTab = {
                orgId: x.orgId,
                projectId: x.projectId || makeId(),
                remoteType: x.remoteType,
                name: x.name,
                defaultBranch: x.defaultBranch,
                gitUrl: x.gitUrl,
                publicKey: x.publicKey,
                privateKey: x.privateKey,
                publicKeyEncrypted: x.publicKeyEncrypted,
                privateKeyEncrypted: x.privateKeyEncrypted,
                passPhrase: x.passPhrase,
                e2bApiKey: x.e2bApiKey,
                nameHash: undefined, // tab-to-ent
                gitUrlHash: undefined, // tab-to-ent
                keyTag: undefined,
                serverTs: undefined
              };

              let baseProject: BaseProject =
                this.tabService.projectTabToBaseProject({
                  project: newProject
                });

              let prodEnv: EnvTab = this.envsService.makeEnv({
                projectId: baseProject.projectId,
                envId: PROJECT_ENV_PROD,
                evs: []
              });

              let diskSeedProjectResult: Result.Result<
                ToDiskSeedProjectOutput,
                SendToDiskError
              > = await this.rpcService.sendToDisk({
                request: {
                  operation: 'seedProject',
                  traceId: v.traceId,
                  input: {
                    baseProject: baseProject,
                    seedProjectId: x.seedProjectId,
                    devRepoId: v.prepareSeedPayload.users[0].userId,
                    userAlias: v.prepareSeedPayload.users[0].alias
                  }
                }
              });

              if (Result.isFailure(diskSeedProjectResult)) {
                return diskSeedProjectResult;
              }

              let diskSeedProjectOutput: ToDiskSeedProjectOutput =
                diskSeedProjectResult.value;

              let devStructId: string = makeId();

              let prodStructId: string = makeId();

              let prodEnvConnections: ConnectionTab[] =
                v.prepareSeedPayload.connections.filter(
                  y =>
                    y.projectId === newProject.projectId &&
                    y.envId === prodEnv.envId
                );

              let devRebuildStructOutput: Result.Result<
                RebuildStructOutput,
                RebuildStructError
              > = await this.blockmlService.rebuildStruct({
                traceId: v.traceId,
                orgId: newProject.orgId,
                projectId: newProject.projectId,
                repoId: v.prepareSeedPayload.users[0].userId,
                structId: devStructId,
                diskFiles: diskSeedProjectOutput.files,
                mproveDir: diskSeedProjectOutput.mproveDir,
                envId: prodEnv.envId,
                selectedGivens: [],
                skipDb: true,
                connections: prodEnvConnections,
                overrideTimezone: undefined,
                evs: prodEnv.evs
              });

              if (Result.isFailure(devRebuildStructOutput)) {
                return devRebuildStructOutput;
              }

              let {
                struct: devStruct,
                models: devModelsApi,
                reports: devReportsApi,
                dashboards: devDashboardsApi,
                charts: devChartsApi,
                metrics: devMetricsApi,
                mconfigs: devMconfigsApi,
                queries: devQueriesApi
              } = devRebuildStructOutput.value;

              let prodRebuildStructOutput: Result.Result<
                RebuildStructOutput,
                RebuildStructError
              > = await this.blockmlService.rebuildStruct({
                traceId: v.traceId,
                orgId: newProject.orgId,
                projectId: newProject.projectId,
                repoId: PROD_REPO_ID,
                structId: prodStructId,
                diskFiles: diskSeedProjectOutput.files,
                mproveDir: diskSeedProjectOutput.mproveDir,
                envId: prodEnv.envId,
                selectedGivens: [],
                skipDb: true,
                connections: prodEnvConnections,
                overrideTimezone: undefined,
                evs: prodEnv.evs
              });

              if (Result.isFailure(prodRebuildStructOutput)) {
                return prodRebuildStructOutput;
              }

              let {
                struct: prodStruct,
                models: prodModelsApi,
                reports: prodReportsApi,
                dashboards: prodDashboardsApi,
                charts: prodChartsApi,
                metrics: prodMetricsApi,
                mconfigs: prodMconfigsApi,
                queries: prodQueriesApi
              } = prodRebuildStructOutput.value;

              let devBranch: BranchTab = this.branchesService.makeBranch({
                projectId: newProject.projectId,
                repoId: v.prepareSeedPayload.users[0].userId,
                branchId: newProject.defaultBranch
              });

              let prodBranch: BranchTab = this.branchesService.makeBranch({
                projectId: newProject.projectId,
                repoId: PROD_REPO_ID,
                branchId: newProject.defaultBranch
              });

              let devBranchBridgeProdEnv: BridgeTab =
                this.bridgesService.makeBridge({
                  projectId: devBranch.projectId,
                  repoId: devBranch.repoId,
                  branchId: devBranch.branchId,
                  envId: prodEnv.envId,
                  structId: devStructId,
                  needValidate: false
                });

              let prodBranchBridgeProdEnv: BridgeTab =
                this.bridgesService.makeBridge({
                  projectId: prodBranch.projectId,
                  repoId: prodBranch.repoId,
                  branchId: prodBranch.branchId,
                  envId: prodEnv.envId,
                  structId: prodStructId,
                  needValidate: false
                });

              v.prepareSeedPayload.projects.push(newProject);

              v.prepareSeedPayload.envs.push(prodEnv);

              v.prepareSeedPayload.structs = [
                ...v.prepareSeedPayload.structs,
                devStruct,
                prodStruct
              ];

              v.prepareSeedPayload.branches = [
                ...v.prepareSeedPayload.branches,
                devBranch,
                prodBranch
              ];

              v.prepareSeedPayload.bridges = [
                ...v.prepareSeedPayload.bridges,
                devBranchBridgeProdEnv,
                prodBranchBridgeProdEnv
              ];

              v.prepareSeedPayload.charts = [
                ...v.prepareSeedPayload.charts,
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

              v.prepareSeedPayload.models = [
                ...v.prepareSeedPayload.models,
                ...devModelsApi.map(y =>
                  this.modelsService.apiToTab({ apiModel: y })
                ),
                ...prodModelsApi.map(y =>
                  this.modelsService.apiToTab({ apiModel: y })
                )
              ];

              v.prepareSeedPayload.reports = [
                ...v.prepareSeedPayload.reports,
                ...devReportsApi.map(y =>
                  this.reportsService.apiToTab({ apiReport: y })
                ),
                ...prodReportsApi.map(y =>
                  this.reportsService.apiToTab({ apiReport: y })
                )
              ];

              v.prepareSeedPayload.queries = [
                ...v.prepareSeedPayload.queries,
                ...devQueriesApi.map(y =>
                  this.queriesService.apiToTab({ apiQuery: y })
                ),
                ...prodQueriesApi.map(y =>
                  this.queriesService.apiToTab({ apiQuery: y })
                )
              ];

              v.prepareSeedPayload.dashboards = [
                ...v.prepareSeedPayload.dashboards,
                ...devDashboardsApi.map(y =>
                  this.dashboardsService.apiToTab({ apiDashboard: y })
                ),
                ...prodDashboardsApi.map(y =>
                  this.dashboardsService.apiToTab({ apiDashboard: y })
                )
              ];

              v.prepareSeedPayload.mconfigs = [
                ...v.prepareSeedPayload.mconfigs,
                ...devMconfigsApi.map(y =>
                  this.mconfigsService.apiToTab({ apiMconfig: y })
                ),
                ...prodMconfigsApi.map(y =>
                  this.mconfigsService.apiToTab({ apiMconfig: y })
                )
              ];

              return Result.succeed();
            }
          });
        }

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        if (isDefined(v.payloadMembers)) {
          await asyncPool(
            1,
            v.payloadMembers,
            async (x: ToBackendSeedRecordsInputMembersItem) => {
              let user: UserTab = v.prepareSeedPayload.users.find(
                u => u.email === x.email
              );

              let newMember: MemberTab = this.membersService.makeMember({
                projectId: x.projectId,
                user: user,
                roles: x.roles,
                isAdmin: x.isAdmin,
                isEditor: x.isEditor,
                isExplorer: x.isExplorer
              });

              v.prepareSeedPayload.members.push(newMember);
            }
          );
        }

        return Result.succeed();
      }),
      Result.map(v => {
        if (isDefined(v.payloadQueries)) {
          v.prepareSeedPayload.queries = [
            ...v.prepareSeedPayload.queries,
            ...v.payloadQueries.map(pq =>
              this.queriesService.apiToTab({ apiQuery: pq })
            )
          ];
        }

        return v;
      }),
      Result.map(v => {
        if (isDefined(v.payloadMconfigs)) {
          v.prepareSeedPayload.mconfigs = [
            ...v.prepareSeedPayload.mconfigs,
            ...v.payloadMconfigs.map(mc =>
              this.mconfigsService.apiToTab({ apiMconfig: mc })
            )
          ];
        }

        return v;
      }),
      Result.map(v => {
        if (isDefined(v.payloadCachedColumns)) {
          v.payloadCachedColumns.forEach(
            (x: ToBackendSeedRecordsInputCachedColumnsItem) => {
              let newCachedColumn: CachedColumnTab = {
                cachedColumnFullId: undefined, // tab-to-ent
                projectId: x.projectId,
                connectionId: x.connectionId,
                envId: x.envId,
                schemaNameLc: x.schemaNameLc,
                tableNameLc: x.tableNameLc,
                columnNameLc: x.columnNameLc,
                requestedByUserId: x.requestedByUserId,
                status: x.status,
                errorMessage: x.errorMessage,
                startedTs: x.startedTs,
                completedTs: x.completedTs,
                completedDurationMs: x.completedDurationMs,
                limit: x.limit,
                sampleSize: x.sampleSize,
                isLimitReached: x.isLimitReached,
                uniqueValuesCount: x.uniqueValuesCount,
                keyTag: undefined,
                serverTs: undefined
              };

              v.prepareSeedPayload.cachedColumns.push(newCachedColumn);
            }
          );
        }

        return v;
      }),
      Result.map(v => {
        if (isDefined(v.payloadCachedParts)) {
          v.payloadCachedParts.forEach(
            (x: ToBackendSeedRecordsInputCachedPartsItem) => {
              let newCachedPart: CachedPartTab = {
                cachedPartFullId: undefined, // tab-to-ent
                projectId: x.projectId,
                connectionId: x.connectionId,
                envId: x.envId,
                schemaNameLc: x.schemaNameLc,
                tableNameLc: x.tableNameLc,
                columnNameLc: x.columnNameLc,
                columnValue: x.columnValue,
                columnValueLc: x.columnValueLc,
                count: x.count,
                keyTag: undefined,
                serverTs: undefined
              };

              v.prepareSeedPayload.cachedParts.push(newCachedPart);
            }
          );
        }

        return v;
      }),
      Result.map(v => {
        if (isDefined(v.payloadModelFieldLeafs)) {
          v.payloadModelFieldLeafs.forEach(
            (x: ToBackendSeedRecordsInputModelFieldLeafsItem) => {
              let newModelFieldLeaf: ModelFieldLeafTab = {
                structId: x.structId,
                modelId: x.modelId,
                modelType: x.modelType,
                connectionId: x.connectionId,
                connectionType: undefined,
                fieldId: x.fieldId,
                fieldNameLc: x.fieldNameLc,
                fieldPath: undefined,
                fieldClass: undefined,
                fieldResult: x.fieldResult,
                fieldType: undefined,
                labelLc: x.labelLc,
                descriptionLc: x.descriptionLc,
                hidden: undefined,
                required: undefined,
                sqlNameLc: x.sqlNameLc,
                topId: undefined,
                topLabel: undefined,
                groupId: undefined,
                groupLabel: undefined,
                malloyFieldNameLc: x.malloyFieldNameLc,
                malloyFieldPath: undefined,
                malloyTags: undefined,
                mproveTags: undefined,
                schemaNameLc: x.schemaNameLc,
                tableNameLc: x.tableNameLc,
                columnNameLc: x.columnNameLc,
                field: {} as any,
                malloyFieldDef: undefined,
                serverTs: undefined
              };

              v.prepareSeedPayload.modelFieldLeafs.push(newModelFieldLeaf);
            }
          );
        }

        return v;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async (): Promise<void> => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.writeUnwrap({
                      tx: tx,
                      insert: {
                        users: v.prepareSeedPayload.users,
                        orgs: v.prepareSeedPayload.orgs,
                        projects: v.prepareSeedPayload.projects,
                        envs: v.prepareSeedPayload.envs,
                        members: v.prepareSeedPayload.members,
                        connections: v.prepareSeedPayload.connections,
                        providers: v.prepareSeedPayload.providers,
                        branches: v.prepareSeedPayload.branches,
                        bridges: v.prepareSeedPayload.bridges,
                        structs: v.prepareSeedPayload.structs,
                        charts: v.prepareSeedPayload.charts,
                        models: v.prepareSeedPayload.models,
                        reports: v.prepareSeedPayload.reports,
                        mconfigs: v.prepareSeedPayload.mconfigs,
                        dashboards: v.prepareSeedPayload.dashboards,
                        sessions: v.prepareSeedPayload.sessions,
                        cachedColumns: v.prepareSeedPayload.cachedColumns,
                        cachedParts: v.prepareSeedPayload.cachedParts,
                        modelFieldLeafs: v.prepareSeedPayload.modelFieldLeafs
                      },
                      insertOrUpdate: {
                        queries: v.prepareSeedPayload.queries
                      }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map((v): ToBackendSeedRecordsOutput => ({}))
    );
  }
}
