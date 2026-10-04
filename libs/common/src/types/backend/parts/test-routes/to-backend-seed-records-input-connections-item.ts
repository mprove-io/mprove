import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import { zConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import {
  type ConnectionRawSchema,
  zConnectionRawSchema
} from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';

export type ToBackendSeedRecordsInputConnectionsItem = {
  projectId: string;
  envId: string;
  connectionId: string;
  type: ConnectionType;
  options?: ConnectionOptions;
  rawSchema?: ConnectionRawSchema;
};

export let zToBackendSeedRecordsInputConnectionsItem = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    type: zConnectionType,
    options: zConnectionOptions.nullish(),
    rawSchema: zConnectionRawSchema.nullish()
  })
  .meta({ id: 'ToBackendSeedRecordsInputConnectionsItem' });

assertTypesEqual<
  ToBackendSeedRecordsInputConnectionsItem,
  z.infer<typeof zToBackendSeedRecordsInputConnectionsItem>
>({ value: true });
