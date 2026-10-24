import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '#backend/auth-strategies/jwt/jwt.strategy';
import { LocalStrategy } from '#backend/auth-strategies/local-strategy/local-strategy.strategy';
import type { BackendConfig } from '#backend/config/backend-config';
import { AscendingIdService } from '#backend/services/ascending-id/ascending-id.service';
import { DbService } from '#backend/services/db/db.service';
import { DocService } from '#backend/services/doc/doc.service';
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
import { SearchModelFieldsService } from '#backend/services/explorer/tools/search-model-fields/search-model-fields.service';
import { LlmModelService } from '#backend/services/llm-model/llm-model.service';
import { RedisService } from '#backend/services/redis/redis.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { SessionDrainService } from '#backend/services/session/session-drain/session-drain.service';
import { SessionDrainTimerService } from '#backend/services/session/session-drain-timer/session-drain-timer.service';
import { SessionSseService } from '#backend/services/session/session-sse/session-sse.service';
import { TabService } from '#backend/services/tab/tab.service';
import { TasksService } from '#backend/services/tasks/tasks.service';
import { UrlService } from '#backend/services/url/url.service';
import { GetExplorerChartTabService } from './controllers/charts/get-explorer-chart-tab/get-explorer-chart-tab.service';
import { GetConnectionSampleService } from './controllers/connections/get-connection-sample/get-connection-sample.service';
import { GetConnectionSchemasService } from './controllers/connections/get-connection-schemas/get-connection-schemas.service';
import { GetConnectionsListService } from './controllers/connections/get-connections-list/get-connections-list.service';
import { ValidateFilesService } from './controllers/files/validate-files/validate-files.service';
import { ListDocsService } from './controllers/mcp-tools/list-docs/list-docs.service';
import { ReadDocsService } from './controllers/mcp-tools/read-docs/read-docs.service';
import { SearchDocsService } from './controllers/mcp-tools/search-docs/search-docs.service';
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
  AscendingIdService,
  DbService,
  DocService,
  EmailService,
  RpcService,
  RedisService,
  TabService,
  UrlService,
  LlmModelService,
  //
  EditorOpencodeService,
  EditorCodexService,
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
  SearchModelFieldsService,
  SearchModelFieldsToolService,
  ProduceChartToolService,
  ExplorerToolsService,
  ExplorerModelsService,
  ExplorerChartRebuildService,
  EditorConnectionsService,
  ExplorerStreamService,
  ProduceExplorerChartService,
  GetExplorerChartTabService,
  //
  ListDocsService,
  ReadDocsService,
  SearchDocsService,
  GetConnectionSampleService,
  GetConnectionsListService,
  GetConnectionSchemasService,
  ValidateFilesService,
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
      editorSandboxService: EditorSandboxService,
      editorSessionLockService: EditorSessionLockService,
      editorStreamService: EditorStreamService,
      logger: Logger,
      db: DbService
    ) =>
      cs.get<BackendConfig['isScheduler']>('isScheduler') === true
        ? new TasksService(
            cs,
            editorSandboxService,
            editorSessionLockService,
            editorStreamService,
            logger,
            db
          )
        : {},
    inject: [
      ConfigService,
      EditorSandboxService,
      EditorSessionLockService,
      EditorStreamService,
      Logger,
      DbService
    ]
  }
];
