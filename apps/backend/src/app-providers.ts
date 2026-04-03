import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendConfig } from '#backend/config/backend-config';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalStrategy } from './auth-strategies/local-strategy.strategy';
import { GetConnectionSampleService } from './controllers/connections/get-connection-sample/get-connection-sample.service';
import { GetConnectionSampleTool } from './controllers/connections/get-connection-sample/get-connection-sample.tool';
import { GetConnectionSchemasService } from './controllers/connections/get-connection-schemas/get-connection-schemas.service';
import { GetConnectionSchemasTool } from './controllers/connections/get-connection-schemas/get-connection-schemas.tool';
import { GetConnectionsListService } from './controllers/connections/get-connections-list/get-connections-list.service';
import { GetConnectionsListTool } from './controllers/connections/get-connections-list/get-connections-list.tool';
import { ValidateFilesService } from './controllers/files/validate-files/validate-files.service';
import { ValidateFilesTool } from './controllers/files/validate-files/validate-files.tool';
import { GetModelService } from './controllers/models/get-model/get-model.service';
import { GetModelTool } from './controllers/models/get-model/get-model.tool';
import { RunQueriesService } from './controllers/queries/run-queries/run-queries.service';
import { GetQueryInfoService } from './controllers/query-info/get-query-info/get-query-info.service';
import { GetQueryInfoTool } from './controllers/query-info/get-query-info/get-query-info.tool';
import { RunService } from './controllers/run/run/run.service';
import { RunTool } from './controllers/run/run/run.tool';
import { RunChartService } from './controllers/run/run/run-chart.service';
import { RunDashboardService } from './controllers/run/run/run-dashboard.service';
import { RunReportService } from './controllers/run/run/run-report.service';
import { GetStateService } from './controllers/state/get-state/get-state.service';
import { GetStateTool } from './controllers/state/get-state/get-state.tool';
import { BlockmlService } from './services/blockml.service';
import { AvatarsService } from './services/db/avatars.service';
import { BranchesService } from './services/db/branches.service';
import { BridgesService } from './services/db/bridges.service';
import { ChartsService } from './services/db/charts.service';
import { ConnectionsService } from './services/db/connections.service';
import { DashboardsService } from './services/db/dashboards.service';
import { DconfigsService } from './services/db/dconfigs.service';
import { EnvsService } from './services/db/envs.service';
import { KitsService } from './services/db/kits.service';
import { MconfigsService } from './services/db/mconfigs.service';
import { MembersService } from './services/db/members.service';
import { ModelsService } from './services/db/models.service';
import { NotesService } from './services/db/notes.service';
import { OcEventsService } from './services/db/oc-events.service';
import { OcMessagesService } from './services/db/oc-messages.service';
import { OcPartsService } from './services/db/oc-parts.service';
import { OrgsService } from './services/db/orgs.service';
import { ProjectsService } from './services/db/projects.service';
import { QueriesService } from './services/db/queries.service';
import { ReportsService } from './services/db/reports.service';
import { SessionsService } from './services/db/sessions.service';
import { StructsService } from './services/db/structs.service';
import { UsersService } from './services/db/users.service';
import { DocService } from './services/doc.service';
import { BigQueryService } from './services/dwh/bigquery.service';
import { DatabricksService } from './services/dwh/databricks.service';
import { DuckDbService } from './services/dwh/duckdb.service';
import { MysqlService } from './services/dwh/mysql.service';
import { PgService } from './services/dwh/pg.service';
import { PrestoService } from './services/dwh/presto.service';
import { SnowFlakeService } from './services/dwh/snowflake.service';
import { TrinoService } from './services/dwh/trino.service';
import { EditorCodexService } from './services/editor/editor-codex.service';
import { EditorConnectionsService } from './services/editor/editor-connections.service';
import { EditorModelsService } from './services/editor/editor-models.service';
import { EditorOpencodeService } from './services/editor/editor-opencode.service';
import { EditorSandboxService } from './services/editor/editor-sandbox.service';
import { EditorStreamService } from './services/editor/editor-stream.service';
import { EmailService } from './services/email.service';
import { ExplorerEventsMakerService } from './services/explorer/explorer-events-maker.service';
import { ExplorerModelsService } from './services/explorer/explorer-models.service';
import { ExplorerPromptsService } from './services/explorer/explorer-prompts.service';
import { ExplorerStreamService } from './services/explorer/explorer-stream.service';
import { ExplorerTitleService } from './services/explorer/explorer-title.service';
import { ExplorerToolsService } from './services/explorer/explorer-tools.service';
import { HashService } from './services/hash.service';
import { MalloyService } from './services/malloy.service';
import { ParentService } from './services/parent.service';
import { QueryInfoChartService } from './services/query-info-chart.service';
import { QueryInfoDashboardService } from './services/query-info-dashboard.service';
import { QueryInfoReportService } from './services/query-info-report.service';
import { RedisService } from './services/redis.service';
import { ReportDataService } from './services/report-data.service';
import { ReportRowService } from './services/report-row.service';
import { ReportTimeColumnsService } from './services/report-time-columns.service';
import { RpcService } from './services/rpc.service';
import { SessionArchiveService } from './services/session/session-archive.service';
import { SessionDrainService } from './services/session/session-drain.service';
import { SessionDrainTimerService } from './services/session/session-drain-timer.service';
import { SessionSseService } from './services/session/session-sse.service';
import { StoreService } from './services/store.service';
import { TabService } from './services/tab.service';
import { TabCheckerService } from './services/tab-checker.service';
import { TabToEntService } from './services/tab-to-ent.service';
import { TasksService } from './services/tasks.service';
import { ToolService } from './services/tool.service';
import { UserCodeService } from './services/user-code.service';

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
  QueriesService,
  ReportsService,
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
  //
  SessionsService,
  EditorOpencodeService,
  EditorCodexService,
  SessionArchiveService,
  SessionDrainService,
  SessionDrainTimerService,
  SessionSseService,
  EditorStreamService,
  EditorSandboxService,
  ExplorerEventsMakerService,
  ExplorerPromptsService,
  ExplorerTitleService,
  ExplorerToolsService,
  ExplorerModelsService,
  EditorConnectionsService,
  EditorModelsService,
  ExplorerStreamService,
  //
  ToolService,
  GetConnectionSampleService,
  GetConnectionsListService,
  GetConnectionSchemasService,
  ValidateFilesService,
  QueryInfoChartService,
  QueryInfoDashboardService,
  QueryInfoReportService,
  RunQueriesService,
  GetQueryInfoService,
  GetModelService,
  RunChartService,
  RunDashboardService,
  RunReportService,
  RunService,
  GetStateService,
  //
  GetConnectionSampleTool,
  GetConnectionsListTool,
  GetConnectionSchemasTool,
  ValidateFilesTool,
  GetQueryInfoTool,
  GetModelTool,
  RunTool,
  GetStateTool,
  {
    provide: TasksService,
    useFactory: (
      cs: ConfigService<BackendConfig>,
      queriesService: QueriesService,
      structsService: StructsService,
      notesService: NotesService,
      editorSandboxService: EditorSandboxService,
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
      EditorStreamService,
      Logger
    ]
  },
  UserCodeService
];
