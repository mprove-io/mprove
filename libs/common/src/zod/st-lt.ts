import type { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import type {
  Event,
  Message,
  Part,
  PermissionRequest,
  QuestionRequest,
  Session,
  SessionStatus,
  Todo
} from '@opencode-ai/sdk/v2';
import { z } from 'zod';
import { zCodexAuth } from '#common/zod/backend/codex-auth';
import { zConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import { zExtraSchema } from '#common/zod/backend/connection-schemas/extra-schema';
import { zConnectionRawSchema } from '#common/zod/backend/connection-schemas/raw-schema';
import { zEv } from '#common/zod/backend/ev';
import { zMproveConfig } from '#common/zod/backend/mprove-config';
import { zUi } from '#common/zod/backend/ui';
import { zBmlError } from '#common/zod/blockml/bml-error';
import { zDashboardField } from '#common/zod/blockml/dashboard-field';
import { zFilter } from '#common/zod/blockml/filter';
import { zFileStore } from '#common/zod/blockml/internal/file-store';
import { zMconfigChart } from '#common/zod/blockml/mconfig-chart';
import { zModelField } from '#common/zod/blockml/model-field';
import { zModelMetric } from '#common/zod/blockml/model-metric';
import { zModelNode } from '#common/zod/blockml/model-node';
import { zPreset } from '#common/zod/blockml/preset';
import { zReportField } from '#common/zod/blockml/report-field';
import { zRow } from '#common/zod/blockml/row';
import { zSorting } from '#common/zod/blockml/sorting';
import { zStorePart } from '#common/zod/blockml/store-part';
import { zTile } from '#common/zod/blockml/tile';

export let zAvatarSt = z
  .object({ avatarSmall: z.string() })
  .meta({ id: 'AvatarSt' });
export type AvatarSt = z.infer<typeof zAvatarSt>;

export let zAvatarLt = z
  .object({ avatarBig: z.string() })
  .meta({ id: 'AvatarLt' });
export type AvatarLt = z.infer<typeof zAvatarLt>;

export let zBranchSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'BranchSt' });
export type BranchSt = z.infer<typeof zBranchSt>;

export let zBranchLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'BranchLt' });
export type BranchLt = z.infer<typeof zBranchLt>;

export let zBridgeSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'BridgeSt' });
export type BridgeSt = z.infer<typeof zBridgeSt>;

export let zBridgeLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'BridgeLt' });
export type BridgeLt = z.infer<typeof zBridgeLt>;

export let zChartSt = z
  .object({
    title: z.string(),
    modelLabel: z.string(),
    filePath: z.string(),
    tiles: z.array(zTile)
  })
  .meta({ id: 'ChartSt' });
export type ChartSt = z.infer<typeof zChartSt>;

export let zChartLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'ChartLt' });
export type ChartLt = z.infer<typeof zChartLt>;

export let zConnectionSt = z
  .object({ options: zConnectionOptions })
  .meta({ id: 'ConnectionSt' });
export type ConnectionSt = z.infer<typeof zConnectionSt>;

export let zConnectionLt = z
  .object({ rawSchema: zConnectionRawSchema.nullish() })
  .meta({ id: 'ConnectionLt' });
export type ConnectionLt = z.infer<typeof zConnectionLt>;

export let zDashboardSt = z
  .object({
    title: z.string(),
    filePath: z.string(),
    accessRoles: z.array(z.string()),
    tiles: z.array(zTile),
    fields: z.array(zDashboardField)
  })
  .meta({ id: 'DashboardSt' });
export type DashboardSt = z.infer<typeof zDashboardSt>;

export let zDashboardLt = z
  .object({ content: z.any() })
  .meta({ id: 'DashboardLt' });
export type DashboardLt = z.infer<typeof zDashboardLt>;

export let zEnvSt = z.object({ evs: z.array(zEv) }).meta({ id: 'EnvSt' });
export type EnvSt = z.infer<typeof zEnvSt>;

export let zEnvLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'EnvLt' });
export type EnvLt = z.infer<typeof zEnvLt>;

export let zDconfigSt = z
  .object({
    hashSecret: z.string(),
    hashSecretCheck: z.string()
  })
  .meta({ id: 'DconfigSt' });
export type DconfigSt = z.infer<typeof zDconfigSt>;

export let zDconfigLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'DconfigLt' });
export type DconfigLt = z.infer<typeof zDconfigLt>;

export let zUconfigSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'UconfigSt' });
export type UconfigSt = z.infer<typeof zUconfigSt>;

export let zUconfigLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'UconfigLt' });
export type UconfigLt = z.infer<typeof zUconfigLt>;

export let zKitSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'KitSt' });
export type KitSt = z.infer<typeof zKitSt>;

export let zKitLt = z.object({ data: z.any() }).meta({ id: 'KitLt' });
export type KitLt = z.infer<typeof zKitLt>;

export let zMconfigSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'MconfigSt' });
export type MconfigSt = z.infer<typeof zMconfigSt>;

export let zMconfigLt = z
  .object({
    dateRangeIncludesRightSide: z.boolean(),
    storePart: zStorePart,
    modelLabel: z.string(),
    modelFilePath: z.string(),
    malloyQueryStable: z.string(),
    malloyQueryExtra: z.string(),
    compiledQuery: z.any(),
    select: z.array(z.string()),
    sortings: z.array(zSorting),
    sorts: z.string(),
    timezone: z.string(),
    limit: z.number(),
    filters: z.array(zFilter),
    chart: zMconfigChart
  })
  .meta({ id: 'MconfigLt' });
export type MconfigLt = z.infer<typeof zMconfigLt>;

export let zMemberSt = z
  .object({
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.string())
  })
  .meta({ id: 'MemberSt' });
export type MemberSt = z.infer<typeof zMemberSt>;

export let zMemberLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'MemberLt' });
export type MemberLt = z.infer<typeof zMemberLt>;

export let zModelSt = z
  .object({ accessRoles: z.array(z.string()) })
  .meta({ id: 'ModelSt' });
export type ModelSt = z.infer<typeof zModelSt>;

export let zModelLt = z
  .object({
    source: z.string(),
    malloyModelDef: z.custom<MalloyModelDef>(),
    filePath: z.string(),
    fileText: z.string(),
    storeContent: zFileStore,
    dateRangeIncludesRightSide: z.boolean(),
    label: z.string(),
    fields: z.array(zModelField),
    nodes: z.array(zModelNode)
  })
  .meta({ id: 'ModelLt' });
export type ModelLt = z.infer<typeof zModelLt>;

export let zNoteSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'NoteSt' });
export type NoteSt = z.infer<typeof zNoteSt>;

export let zNoteLt = z
  .object({
    publicKey: z.string(),
    privateKey: z.string(),
    publicKeyEncrypted: z.string(),
    privateKeyEncrypted: z.string(),
    passPhrase: z.string()
  })
  .meta({ id: 'NoteLt' });
export type NoteLt = z.infer<typeof zNoteLt>;

export let zOrgSt = z
  .object({
    name: z.string(),
    ownerEmail: z.string()
  })
  .meta({ id: 'OrgSt' });
export type OrgSt = z.infer<typeof zOrgSt>;

export let zOrgLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OrgLt' });
export type OrgLt = z.infer<typeof zOrgLt>;

export let zProjectSt = z
  .object({
    name: z.string(),
    zenApiKey: z.string().nullish(),
    anthropicApiKey: z.string().nullish(),
    openaiApiKey: z.string().nullish(),
    e2bApiKey: z.string().nullish()
  })
  .meta({ id: 'ProjectSt' });
export type ProjectSt = z.infer<typeof zProjectSt>;

export let zProjectLt = z
  .object({
    gitUrl: z.string(),
    defaultBranch: z.string(),
    publicKey: z.string(),
    privateKey: z.string(),
    publicKeyEncrypted: z.string(),
    privateKeyEncrypted: z.string(),
    passPhrase: z.string()
  })
  .meta({ id: 'ProjectLt' });
export type ProjectLt = z.infer<typeof zProjectLt>;

export let zQuerySt = z
  .object({
    sql: z.string(),
    lastErrorMessage: z.string(),
    apiMethod: z.string(),
    apiUrl: z.string(),
    apiBody: z.string()
  })
  .meta({ id: 'QuerySt' });
export type QuerySt = z.infer<typeof zQuerySt>;

export let zQueryLt = z.object({ data: z.any() }).meta({ id: 'QueryLt' });
export type QueryLt = z.infer<typeof zQueryLt>;

export let zReportSt = z
  .object({
    filePath: z.string(),
    accessRoles: z.array(z.string()),
    title: z.string(),
    fields: z.array(zReportField),
    chart: zMconfigChart
  })
  .meta({ id: 'ReportSt' });
export type ReportSt = z.infer<typeof zReportSt>;

export let zReportLt = z
  .object({ rows: z.array(zRow) })
  .meta({ id: 'ReportLt' });
export type ReportLt = z.infer<typeof zReportLt>;

export let zStructSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'StructSt' });
export type StructSt = z.infer<typeof zStructSt>;

export let zStructLt = z
  .object({
    errors: z.array(zBmlError),
    metrics: z.array(zModelMetric),
    presets: z.array(zPreset),
    extraSchemas: z.array(zExtraSchema),
    mproveConfig: zMproveConfig
  })
  .meta({ id: 'StructLt' });
export type StructLt = z.infer<typeof zStructLt>;

export let zUserSt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'UserSt' });
export type UserSt = z.infer<typeof zUserSt>;

export let zUserLt = z
  .object({
    email: z.string(),
    alias: z.string(),
    passwordHash: z.string(),
    passwordSalt: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    emailVerificationToken: z.string(),
    passwordResetToken: z.string(),
    passwordResetExpiresTs: z.number(),
    ui: zUi,
    apiKeySecretHash: z.string().nullish(),
    apiKeySalt: z.string().nullish(),
    codexAuth: zCodexAuth.nullish()
  })
  .meta({ id: 'UserLt' });
export type UserLt = z.infer<typeof zUserLt>;

export let zOcEventSt = z
  .object({ ocEvent: z.custom<Event>() })
  .meta({ id: 'OcEventSt' });
export type OcEventSt = z.infer<typeof zOcEventSt>;

export let zOcEventLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OcEventLt' });
export type OcEventLt = z.infer<typeof zOcEventLt>;

export let zSessionSt = z
  .object({
    sandboxId: z.string().nullish(),
    sandboxBaseUrl: z.string().nullish(),
    opencodeSessionId: z.string().nullish(),
    opencodePassword: z.string().nullish(),
    firstMessage: z.string().nullish(),
    apiKeySecretHash: z.string().nullish(),
    apiKeySalt: z.string().nullish()
  })
  .meta({ id: 'SessionSt' });
export type SessionSt = z.infer<typeof zSessionSt>;

export let zSessionLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'SessionLt' });
export type SessionLt = z.infer<typeof zSessionLt>;

export let zOcSessionSt = z
  .object({
    openSession: z.custom<Session>().nullish(),
    todos: z.array(z.custom<Todo>()).nullish(),
    questions: z.array(z.custom<QuestionRequest>()).nullish(),
    permissions: z.array(z.custom<PermissionRequest>()).nullish(),
    ocSessionStatus: z.custom<SessionStatus>().nullish(),
    lastSessionError: z.record(z.string(), z.unknown()).nullish(),
    isLastErrorRecovered: z.boolean().nullish()
  })
  .meta({ id: 'OcSessionSt' });
export type OcSessionSt = z.infer<typeof zOcSessionSt>;

export let zOcSessionLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OcSessionLt' });
export type OcSessionLt = z.infer<typeof zOcSessionLt>;

export let zOcMessageSt = z
  .object({ ocMessage: z.custom<Message>() })
  .meta({ id: 'OcMessageSt' });
export type OcMessageSt = z.infer<typeof zOcMessageSt>;

export let zOcMessageLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OcMessageLt' });
export type OcMessageLt = z.infer<typeof zOcMessageLt>;

export let zOcPartSt = z
  .object({ ocPart: z.custom<Part>() })
  .meta({ id: 'OcPartSt' });
export type OcPartSt = z.infer<typeof zOcPartSt>;

export let zOcPartLt = z
  .object({ emptyData: z.number().nullish() })
  .meta({ id: 'OcPartLt' });
export type OcPartLt = z.infer<typeof zOcPartLt>;
