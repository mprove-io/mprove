import { seconds } from '@nestjs/throttler';
import { FractionOperatorEnum } from '#common/enums/fraction/fraction-operator.enum';
import { FractionTsLastCompleteOptionEnum } from '#common/enums/fraction/fraction-ts-last-complete-option.enum';
import { FractionTsUnitEnum } from '#common/enums/fraction/fraction-ts-unit.enum';
import { FractionTypeEnum } from '#common/enums/fraction/fraction-type.enum';
import { ModelTreeLevelsEnum } from '#common/enums/model-tree-levels-enum.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Ui } from '#common/zod/backend/ui';
import { UTC } from './top';

export const APP_NAME_BACKEND = 'BACKEND';
export const APP_NAME_SCHEDULER = 'SCHEDULER';

export const OPEN_API_ALLOWED_PATHS = new Set<string>([
  ...Object.values(ToBackendRequestInfoNameEnum).map(v => `/${v}`),
  // route not in enum
  '/api/sse/session-events' // GetSessionEventsSseController (@Sse)
  // '/*' // CheckController (@Controller('*') + @Get()) — catch-all 404 handler
]);

export const CHANNEL_RPC_REPLY = 'rpc-reply';
export const CHANNEL_OPENCODE_STREAM_COMMAND = 'opencode-stream-command';
export const CHANNEL_OPENCODE_INTERACT_REPLY = 'opencode-interact-reply';
export const CHANNEL_OPENCODE_FETCH_REPLY = 'opencode-fetch-reply';
export const CHANNEL_AI_STREAM_COMMAND = 'ai-stream-command';
export const CHANNEL_AI_INTERACT_REPLY = 'ai-interact-reply';

export const KEY_SSE_TICKET = 'sse-ticket';
export const KEY_OPENCODE_STREAM_OWNER = 'opencode-stream-owner';
export const KEY_AI_STREAM_OWNER = 'ai-stream-owner';

export const MODEL_PROVIDERS: { provider_id: string; label: string }[] = [
  { provider_id: 'openai', label: 'OpenAI' },
  { provider_id: 'anthropic', label: 'Anthropic' },
  { provider_id: 'opencode', label: 'Zen' }
];

export const ALLOWED_MODEL_KEYWORDS: string[] = [
  'opus',
  'sonnet',
  'codex',
  'gpt-5.4'
];

export const PASSWORD_EXPIRES_OFFSET = 86400000;

export const IDEMP_EXPIRE_SECONDS = 600;

export const SKIP_JWT = 'skipJwt';

export const THROTTLE_MULTIPLIER = 3;

export const THROTTLE_CUSTOM = {
  '1s': {
    limit: 5 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 10 * THROTTLE_MULTIPLIER
  },
  '60s': {
    limit: 60 * THROTTLE_MULTIPLIER
  },
  '600s': {
    limit: 5 * 60 * THROTTLE_MULTIPLIER,
    blockDuration: seconds(12 * 60 * 60) // 12h
  }
};

export const THROTTLE_TELEMETRY = {
  '1s': {
    limit: 10 * THROTTLE_MULTIPLIER
  },
  '5s': {
    limit: 20 * THROTTLE_MULTIPLIER
  },
  '60s': {
    limit: 99999 * THROTTLE_MULTIPLIER
  },
  '600s': {
    limit: 99999 * THROTTLE_MULTIPLIER
  }
};

export const MCP_TOOL_RUN = 'run';
export const MCP_TOOL_GET_STATE = 'get-state';
export const MCP_TOOL_GET_MODEL = 'get-model';
export const MCP_TOOL_GET_QUERY_INFO = 'get-query-info';
export const MCP_TOOL_VALIDATE = 'validate';
export const MCP_TOOL_GET_SAMPLE = 'get-sample';
export const MCP_TOOL_GET_SCHEMAS = 'get-schemas';
export const MCP_TOOL_GET_CONNECTIONS_LIST = 'get-connections-list';
export const MCP_TOOL_DOWNLOAD_SKILLS = 'download-skills';

export const BACKEND_E2E_RETRY_OPTIONS = {
  retries: 2,
  minTimeout: 1000,
  factor: 1,
  randomize: true,
  onRetry: (e: any, attempt: number) => {
    console.log(`Retry attempt ${attempt}:`, e.message);
  }
};

export const DEFAULT_QUERY_SIZE_LIMIT = 1;

export const UNK_ST_ID = 'unk';

export const DEFAULT_SRV_UI: Ui = {
  modelTreeLevels: ModelTreeLevelsEnum.FlatTime,
  timezone: UTC,
  timeSpec: TimeSpecEnum.Days,
  timeRangeFraction: {
    brick: 'f`last 5 days`',
    parentBrick: 'f`last 5 days`',
    operator: FractionOperatorEnum.Or,
    tsLastCompleteOption: FractionTsLastCompleteOptionEnum.CompleteWithCurrent,
    tsLastUnit: FractionTsUnitEnum.Days,
    tsLastValue: 5,
    type: FractionTypeEnum.TsIsInLast
  },
  projectModelLinks: [],
  projectChartLinks: [],
  projectDashboardLinks: [],
  projectExplorerSessionLinks: [],
  projectReportLinks: [],
  permissionsAutoAcceptSessionIds: [],
  newSessionPermissionsAutoAccept: false,
  newSessionExplorerProviderModel: undefined,
  newSessionEditorProviderModel: undefined,
  newSessionEditorVariant: 'default',
  newSessionUseCodex: true
};
