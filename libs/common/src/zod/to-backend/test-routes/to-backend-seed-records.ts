import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { zConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import { zEv } from '#common/zod/backend/ev';
import { zMconfig } from '#common/zod/blockml/mconfig';
import { zQuery } from '#common/zod/blockml/query';
import { zMyResponse } from '#common/zod/to/my-response';
import { zResponseInfo } from '#common/zod/to/response-info';
import { zToBackendRequest } from '#common/zod/to-backend/to-backend-request';
import { zToBackendRequestInfo } from '#common/zod/to-backend/to-backend-request-info';

export let zToBackendSeedRecordsRequestPayloadUsersItem = z
  .object({
    userId: z.string().nullish(),
    email: z.string(),
    password: z.string().nullish(),
    isEmailVerified: z.boolean().nullish(),
    emailVerificationToken: z.string().nullish(),
    passwordResetToken: z.string().nullish(),
    passwordResetExpiresTs: z.number().nullish(),
    apiKey: z.string().nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsRequestPayloadUsersItem' });

export let zToBackendSeedRecordsRequestPayloadOrgsItem = z
  .object({
    orgId: z.string().nullish(),
    name: z.string(),
    ownerId: z.string().nullish(),
    ownerEmail: z.string()
  })
  .meta({ id: 'ToBackendSeedRecordsRequestPayloadOrgsItem' });

export let zToBackendSeedRecordsRequestPayloadProjectsItem = z
  .object({
    orgId: z.string(),
    projectId: z.string().nullish(),
    testProjectId: z.string().nullish(),
    name: z.string(),
    defaultBranch: z.string(),
    remoteType: z.enum(ProjectRemoteTypeEnum),
    gitUrl: z.string().nullish(),
    publicKey: z.string().nullish(),
    privateKey: z.string().nullish(),
    publicKeyEncrypted: z.string().nullish(),
    privateKeyEncrypted: z.string().nullish(),
    passPhrase: z.string().nullish(),
    e2bApiKey: z.string().nullish(),
    zenApiKey: z.string().nullish(),
    anthropicApiKey: z.string().nullish(),
    openaiApiKey: z.string().nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsRequestPayloadProjectsItem' });

export let zToBackendSeedRecordsRequestPayloadMembersItem = z
  .object({
    projectId: z.string(),
    email: z.string(),
    memberId: z.string(),
    roles: z.array(z.string()).nullish(),
    envs: z.array(z.string()).nullish(),
    isAdmin: z.boolean(),
    isEditor: z.boolean(),
    isExplorer: z.boolean()
  })
  .meta({ id: 'ToBackendSeedRecordsRequestPayloadMembersItem' });

export let zToBackendSeedRecordsRequestPayloadConnectionsItem = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    type: z.enum(ConnectionTypeEnum),
    options: zConnectionOptions.nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsRequestPayloadConnectionsItem' });

export let zToBackendSeedRecordsRequestPayloadEnvsItem = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    evs: z.array(zEv).nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsRequestPayloadEnvsItem' });

export let zToBackendSeedRecordsRequestPayloadSessionsItem = z
  .object({
    sessionId: z.string(),
    userId: z.string(),
    projectId: z.string(),
    apiKey: z.string(),
    apiKeyPrefix: z.string(),
    apiKeySecretHash: z.string(),
    apiKeySalt: z.string(),
    status: z.enum(SessionStatusEnum),
    type: z.enum(SessionTypeEnum),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string()
  })
  .meta({ id: 'ToBackendSeedRecordsRequestPayloadSessionsItem' });

export let zToBackendSeedRecordsRequestPayload = z
  .object({
    users: z.array(zToBackendSeedRecordsRequestPayloadUsersItem).nullish(),
    orgs: z.array(zToBackendSeedRecordsRequestPayloadOrgsItem).nullish(),
    projects: z
      .array(zToBackendSeedRecordsRequestPayloadProjectsItem)
      .nullish(),
    members: z.array(zToBackendSeedRecordsRequestPayloadMembersItem).nullish(),
    connections: z
      .array(zToBackendSeedRecordsRequestPayloadConnectionsItem)
      .nullish(),
    envs: z.array(zToBackendSeedRecordsRequestPayloadEnvsItem).nullish(),
    sessions: z
      .array(zToBackendSeedRecordsRequestPayloadSessionsItem)
      .nullish(),
    queries: z.array(zQuery).nullish(),
    mconfigs: z.array(zMconfig).nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsRequestPayload' });

export let zToBackendSeedRecordsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  })
  .meta({ id: 'ToBackendSeedRecordsRequestInfo' });

export let zToBackendSeedRecordsRequest = zToBackendRequest
  .extend({
    info: zToBackendSeedRecordsRequestInfo,
    payload: zToBackendSeedRecordsRequestPayload
  })
  .meta({ id: 'ToBackendSeedRecordsRequest' });

export let zToBackendSeedRecordsResponsePayload = z
  .object({})
  .meta({ id: 'ToBackendSeedRecordsResponsePayload' });

export let zToBackendSeedRecordsResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendSeedRecords}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendSeedRecordsResponseInfo' });

export let zToBackendSeedRecordsResponse = zMyResponse
  .extend({
    info: zToBackendSeedRecordsResponseInfo,
    payload: zToBackendSeedRecordsResponsePayload
  })
  .meta({ id: 'ToBackendSeedRecordsResponse' });

export type ToBackendSeedRecordsRequestPayloadUsersItem = z.infer<
  typeof zToBackendSeedRecordsRequestPayloadUsersItem
>;
export type ToBackendSeedRecordsRequestPayloadOrgsItem = z.infer<
  typeof zToBackendSeedRecordsRequestPayloadOrgsItem
>;
export type ToBackendSeedRecordsRequestPayloadProjectsItem = z.infer<
  typeof zToBackendSeedRecordsRequestPayloadProjectsItem
>;
export type ToBackendSeedRecordsRequestPayloadMembersItem = z.infer<
  typeof zToBackendSeedRecordsRequestPayloadMembersItem
>;
export type ToBackendSeedRecordsRequestPayloadConnectionsItem = z.infer<
  typeof zToBackendSeedRecordsRequestPayloadConnectionsItem
>;
export type ToBackendSeedRecordsRequestPayloadEnvsItem = z.infer<
  typeof zToBackendSeedRecordsRequestPayloadEnvsItem
>;
export type ToBackendSeedRecordsRequestPayloadSessionsItem = z.infer<
  typeof zToBackendSeedRecordsRequestPayloadSessionsItem
>;
export type ToBackendSeedRecordsRequestPayload = z.infer<
  typeof zToBackendSeedRecordsRequestPayload
>;
export type ToBackendSeedRecordsRequest = z.infer<
  typeof zToBackendSeedRecordsRequest
>;
export type ToBackendSeedRecordsResponsePayload = z.infer<
  typeof zToBackendSeedRecordsResponsePayload
>;
export type ToBackendSeedRecordsResponse = z.infer<
  typeof zToBackendSeedRecordsResponse
>;
