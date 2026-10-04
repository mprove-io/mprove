import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import { zConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import type { StoreMethod } from '#common/types/blockml/parts/store/store-method';
import { zStoreMethod } from '#common/types/blockml/parts/store/store-method';

export type ToBackendTestConnectionRequest = {
  operation: 'testConnection';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    connectionId: string;
    type: ConnectionType;
    options?: ConnectionOptions;
    storeMethod?: StoreMethod;
  };
};

export let zToBackendTestConnectionRequest = z
  .strictObject({
    operation: z.literal('testConnection'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string(),
        type: zConnectionType,
        options: zConnectionOptions.nullish(),
        storeMethod: zStoreMethod.nullish()
      })
      .meta({ id: 'ToBackendTestConnectionInput' })
  })
  .meta({ id: 'ToBackendTestConnectionRequest' });

assertTypesEqual<
  ToBackendTestConnectionRequest,
  z.infer<typeof zToBackendTestConnectionRequest>
>({ value: true });
