import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import { zConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';

export type ToBackendCreateConnectionRequest = {
  operation: 'createConnection';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    connectionId: string;
    type: ConnectionType;
    options?: ConnectionOptions;
  };
};

export let zToBackendCreateConnectionRequest = z
  .strictObject({
    operation: z.literal('createConnection'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string().regex(/^[a-z0-9_]+$/, {
          message:
            'connectionId must contain only lowercase letters, digits or underscores'
        }),
        type: zConnectionType,
        options: zConnectionOptions.nullish()
      })
      .meta({ id: 'ToBackendCreateConnectionInput' })
  })
  .meta({ id: 'ToBackendCreateConnectionRequest' });

assertTypesEqual<
  ToBackendCreateConnectionRequest,
  z.infer<typeof zToBackendCreateConnectionRequest>
>({ value: true });
