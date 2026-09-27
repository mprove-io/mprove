import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBackendSeedRecordsInputCachedColumnsItem,
  zToBackendSeedRecordsInputCachedColumnsItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-cached-columns-item';
import {
  type ToBackendSeedRecordsInputCachedPartsItem,
  zToBackendSeedRecordsInputCachedPartsItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-cached-parts-item';
import {
  type ToBackendSeedRecordsInputConnectionsItem,
  zToBackendSeedRecordsInputConnectionsItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-connections-item';
import {
  type ToBackendSeedRecordsInputEnvsItem,
  zToBackendSeedRecordsInputEnvsItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-envs-item';
import {
  type ToBackendSeedRecordsInputMembersItem,
  zToBackendSeedRecordsInputMembersItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-members-item';
import {
  type ToBackendSeedRecordsInputModelFieldLeafsItem,
  zToBackendSeedRecordsInputModelFieldLeafsItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-model-field-leafs-item';
import {
  type ToBackendSeedRecordsInputOrgsItem,
  zToBackendSeedRecordsInputOrgsItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-orgs-item';
import {
  type ToBackendSeedRecordsInputProjectsItem,
  zToBackendSeedRecordsInputProjectsItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-projects-item';
import {
  type ToBackendSeedRecordsInputProvidersItem,
  zToBackendSeedRecordsInputProvidersItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-providers-item';
import {
  type ToBackendSeedRecordsInputSessionsItem,
  zToBackendSeedRecordsInputSessionsItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-sessions-item';
import {
  type ToBackendSeedRecordsInputUsersItem,
  zToBackendSeedRecordsInputUsersItem
} from '#common/zod/backend/test-routes/to-backend-seed-records-input-users-item';
import { type Mconfig, zMconfig } from '#common/zod/blockml/mconfig';
import { type Query, zQuery } from '#common/zod/blockml/query';

export type ToBackendSeedRecordsInput = {
  users?: ToBackendSeedRecordsInputUsersItem[];
  orgs?: ToBackendSeedRecordsInputOrgsItem[];
  projects?: ToBackendSeedRecordsInputProjectsItem[];
  members?: ToBackendSeedRecordsInputMembersItem[];
  connections?: ToBackendSeedRecordsInputConnectionsItem[];
  providers?: ToBackendSeedRecordsInputProvidersItem[];
  envs?: ToBackendSeedRecordsInputEnvsItem[];
  sessions?: ToBackendSeedRecordsInputSessionsItem[];
  queries?: Query[];
  mconfigs?: Mconfig[];
  cachedColumns?: ToBackendSeedRecordsInputCachedColumnsItem[];
  cachedParts?: ToBackendSeedRecordsInputCachedPartsItem[];
  modelFieldLeafs?: ToBackendSeedRecordsInputModelFieldLeafsItem[];
};

export type ToBackendSeedRecordsRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSeedRecordsInput;
};

export let zToBackendSeedRecordsInput = z
  .object({
    users: z.array(zToBackendSeedRecordsInputUsersItem).nullish(),
    orgs: z.array(zToBackendSeedRecordsInputOrgsItem).nullish(),
    projects: z.array(zToBackendSeedRecordsInputProjectsItem).nullish(),
    members: z.array(zToBackendSeedRecordsInputMembersItem).nullish(),
    connections: z.array(zToBackendSeedRecordsInputConnectionsItem).nullish(),
    providers: z.array(zToBackendSeedRecordsInputProvidersItem).nullish(),
    envs: z.array(zToBackendSeedRecordsInputEnvsItem).nullish(),
    sessions: z.array(zToBackendSeedRecordsInputSessionsItem).nullish(),
    queries: z.array(zQuery).nullish(),
    mconfigs: z.array(zMconfig).nullish(),
    cachedColumns: z
      .array(zToBackendSeedRecordsInputCachedColumnsItem)
      .nullish(),
    cachedParts: z.array(zToBackendSeedRecordsInputCachedPartsItem).nullish(),
    modelFieldLeafs: z
      .array(zToBackendSeedRecordsInputModelFieldLeafsItem)
      .nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsInput' });

export let zToBackendSeedRecordsRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSeedRecordsInput
  })
  .meta({ id: 'ToBackendSeedRecordsRequest' });

assertTypesEqual<
  ToBackendSeedRecordsInput,
  z.infer<typeof zToBackendSeedRecordsInput>
>({ value: true });

assertTypesEqual<
  ToBackendSeedRecordsRequest,
  z.infer<typeof zToBackendSeedRecordsRequest>
>({ value: true });
