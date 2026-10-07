import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '#backend/auth-strategies/jwt/jwt.strategy';
import { LocalStrategy } from '#backend/auth-strategies/local-strategy/local-strategy.strategy';
import { BackendConfig } from '#backend/config/backend-config';
import { AscendingIdService } from '#backend/services/ascending-id/ascending-id.service';
import { BlockmlService } from '#backend/services/blockml/blockml.service';
import { CodexService } from '#backend/services/codex/codex.service';
import { AvatarsService } from '#backend/services/db/avatars/avatars.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { CachedColumnService } from '#backend/services/db/cached-column/cached-column.service';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { DconfigsService } from '#backend/services/db/dconfigs/dconfigs.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { FavoritesService } from '#backend/services/db/favorites/favorites.service';
import { GivensService } from '#backend/services/db/givens/givens.service';
import { KitsService } from '#backend/services/db/kits/kits.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { NotesService } from '#backend/services/db/notes/notes.service';
import { OcEventsService } from '#backend/services/db/oc-events/oc-events.service';
import { OcMessagesService } from '#backend/services/db/oc-messages/oc-messages.service';
import { OcPartsService } from '#backend/services/db/oc-parts/oc-parts.service';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { ReportsService } from '#backend/services/db/reports/reports.service';
import { RolesService } from '#backend/services/db/roles/roles.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { DocService } from '#backend/services/doc/doc.service';
import { DocsService } from '#backend/services/docs/docs.service';
import { BigQueryService } from '#backend/services/dwh/bigquery/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql/mysql.service';
import { PgService } from '#backend/services/dwh/pg/pg.service';
import { PrestoService } from '#backend/services/dwh/presto/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino/trino.service';
import { EditorCodexService } from '#backend/services/editor/editor-codex/editor-codex.service';
import { EditorConnectionsService } from '#backend/services/editor/editor-connections/editor-connections.service';
import { EditorOpencodeService } from '#backend/services/editor/editor-opencode/editor-opencode.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { EmailService } from '#backend/services/email/email.service';
import { ExplorerChartRebuildService } from '#backend/services/explorer/explorer-chart-rebuild/explorer-chart-rebuild.service';
import { ExplorerEventsMakerService } from '#backend/services/explorer/explorer-events-maker/explorer-events-maker.service';
import { ExplorerModelPartsService } from '#backend/services/explorer/explorer-model-parts/explorer-model-parts.service';
import { ExplorerModelsService } from '#backend/services/explorer/explorer-models/explorer-models.service';
import { ExplorerPromptsService } from '#backend/services/explorer/explorer-prompts/explorer-prompts.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import { ExplorerTitleService } from '#backend/services/explorer/explorer-title/explorer-title.service';
import { ExplorerToolsService } from '#backend/services/explorer/explorer-tools/explorer-tools.service';
import { ProduceExplorerChartService } from '#backend/services/explorer/tools/produce-chart/produce-explorer-chart/produce-explorer-chart.service';
import { SearchCachedFieldValuesService } from '#backend/services/explorer/tools/search-model-fields/search-cached-field-values/search-cached-field-values.service';
import { SearchDwhSchemaFieldNamesService } from '#backend/services/explorer/tools/search-model-fields/search-dwh-schema-field-names/search-dwh-schema-field-names.service';
import { SearchModelFieldLeafNamesService } from '#backend/services/explorer/tools/search-model-fields/search-model-field-leaf-names/search-model-field-leaf-names.service';
import { HashService } from '#backend/services/hash/hash.service';
import { LlmModelService } from '#backend/services/llm-model/llm-model.service';
import { MalloyService } from '#backend/services/malloy/malloy.service';
import { ParentService } from '#backend/services/parent/parent.service';
import { QueryInfoChartService } from '#backend/services/query-info-chart/query-info-chart.service';
import { QueryInfoDashboardService } from '#backend/services/query-info-dashboard/query-info-dashboard.service';
import { QueryInfoReportService } from '#backend/services/query-info-report/query-info-report.service';
import { RedisService } from '#backend/services/redis/redis.service';
import { ReportDataService } from '#backend/services/report-data/report-data.service';
import { ReportRowService } from '#backend/services/report-row/report-row.service';
import { ReportTimeColumnsService } from '#backend/services/report-time-columns/report-time-columns.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { SessionArchiveService } from '#backend/services/session/session-archive/session-archive.service';
import { SessionDrainService } from '#backend/services/session/session-drain/session-drain.service';
import { SessionDrainTimerService } from '#backend/services/session/session-drain-timer/session-drain-timer.service';
import { SessionSseService } from '#backend/services/session/session-sse/session-sse.service';
import { SpaceService } from '#backend/services/space/space.service';
import { StoreService } from '#backend/services/store/store.service';
import { TabService } from '#backend/services/tab/tab.service';
import { TabCheckerService } from '#backend/services/tab-checker/tab-checker.service';
import { TabToEntService } from '#backend/services/tab-to-ent/tab-to-ent.service';
import { TasksService } from '#backend/services/tasks/tasks.service';
import { ToolService } from '#backend/services/tool/tool.service';
import { UnitsService } from '#backend/services/units/units.service';
import { UrlService } from '#backend/services/url/url.service';
import { UserCodeService } from '#backend/services/user-code/user-code.service';
import { GetExplorerChartTabService } from './controllers/charts/get-explorer-chart-tab/get-explorer-chart-tab.service';
import { GetConnectionSampleService } from './controllers/connections/get-connection-sample/get-connection-sample.service';
import { GetConnectionSchemasService } from './controllers/connections/get-connection-schemas/get-connection-schemas.service';
import { GetConnectionsListService } from './controllers/connections/get-connections-list/get-connections-list.service';
import { ValidateFilesService } from './controllers/files/validate-files/validate-files.service';
import { FullMcpJsonService } from './controllers/mcp-tools-full-json/full-mcp-json.service';
import { GetModelService } from './controllers/models/get-model/get-model.service';
import { GetQueryInfoService } from './controllers/queries/get-query-info/get-query-info.service';
import { RunQueriesService } from './controllers/queries/run-queries/run-queries.service';
import { RunService } from './controllers/run/run/run.service';
import { RunChartService } from './controllers/run/run/run-chart.service';
import { RunDashboardService } from './controllers/run/run/run-dashboard.service';
import { RunReportService } from './controllers/run/run/run-report.service';
import { GetSkillsService } from './controllers/skills/get-skills/get-skills.service';
import { GetStateService } from './controllers/state/get-state/get-state.service';
import { GetModelsToolService } from './services/explorer/tools/get-models/get-models.tool';
import { ProduceChartToolService } from './services/explorer/tools/produce-chart/produce-chart.tool';
import { SearchModelFieldsToolService } from './services/explorer/tools/search-model-fields/search-model-fields.tool';

export const appProviders = [
  LocalStrategy,
  JwtStrategy,
  //
  BranchesService,
  AvatarsService,
  BranchesService,
  BridgesService,
  ChartsService,
  ConnectionsService,
  DashboardsService,
  DconfigsService,
  EnvsService,
  FavoritesService,
  GivensService,
  OcEventsService,
  KitsService,
  MconfigsService,
  MembersService,
  OcMessagesService,
  ModelsService,
  NotesService,
  OrgsService,
  OcPartsService,
  ProjectsService,
  ProvidersService,
  QueriesService,
  ReportsService,
  RolesService,
  StructsService,
  UsersService,
  //
  BigQueryService,
  // ClickHouseService,
  DatabricksService,
  DuckDbService,
  MysqlService,
  PgService,
  PrestoService,
  SnowFlakeService,
  TrinoService,
  //
  BlockmlService,
  AscendingIdService,
  CodexService,
  TabCheckerService,
  DocService,
  EmailService,
  HashService,
  MalloyService,
  ParentService,
  RpcService,
  RedisService,
  ReportDataService,
  ReportRowService,
  ReportTimeColumnsService,
  StoreService,
  TabToEntService,
  TabService,
  UnitsService,
  UrlService,
  LlmModelService,
  //
  SessionsService,
  EditorOpencodeService,
  EditorCodexService,
  SessionArchiveService,
  SessionDrainService,
  SessionDrainTimerService,
  SessionSseService,
  EditorSessionLockService,
  EditorStreamService,
  EditorSandboxService,
  ExplorerEventsMakerService,
  ExplorerModelPartsService,
  ExplorerPromptsService,
  ExplorerTitleService,
  GetModelsToolService,
  SearchCachedFieldValuesService,
  SearchModelFieldLeafNamesService,
  SearchDwhSchemaFieldNamesService,
  SearchModelFieldsToolService,
  ProduceChartToolService,
  ExplorerToolsService,
  ExplorerModelsService,
  ExplorerChartRebuildService,
  DocsService,
  EditorConnectionsService,
  ExplorerStreamService,
  ProduceExplorerChartService,
  GetExplorerChartTabService,
  //
  ToolService,
  SpaceService,
  GetConnectionSampleService,
  GetConnectionsListService,
  GetConnectionSchemasService,
  CachedColumnService,
  ValidateFilesService,
  QueryInfoChartService,
  QueryInfoDashboardService,
  QueryInfoReportService,
  RunQueriesService,
  GetQueryInfoService,
  FullMcpJsonService,
  GetModelService,
  RunChartService,
  RunDashboardService,
  RunReportService,
  RunService,
  GetStateService,
  //
  GetSkillsService,
  {
    provide: TasksService,
    useFactory: (
      cs: ConfigService<BackendConfig>,
      queriesService: QueriesService,
      structsService: StructsService,
      notesService: NotesService,
      editorSandboxService: EditorSandboxService,
      editorSessionLockService: EditorSessionLockService,
      editorStreamService: EditorStreamService,
      logger: Logger
    ) =>
      cs.get<BackendConfig['isScheduler']>('isScheduler') === true
        ? new TasksService(
            cs,
            queriesService,
            structsService,
            notesService,
            editorSandboxService,
            editorSessionLockService,
            editorStreamService,
            logger
          )
        : {},
    inject: [
      ConfigService,
      QueriesService,
      StructsService,
      NotesService,
      EditorSandboxService,
      EditorSessionLockService,
      EditorStreamService,
      Logger
    ]
  },
  UserCodeService
];
