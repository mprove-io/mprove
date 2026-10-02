import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';

export type ToBackendEditConnectionRequest = {
  operation: 'editConnection';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    envId: string;
    connectionId: string;
    options?: ConnectionOptions;
  };
};

export let zToBackendEditConnectionRequest = z
  .strictObject({
    operation: z.literal('editConnection'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        envId: z.string(),
        connectionId: z.string(),
        options: zConnectionOptions.nullish()
      })
      .meta({ id: 'ToBackendEditConnectionInput' })
  })
  .meta({ id: 'ToBackendEditConnectionRequest' });

assertTypesEqual<
  ToBackendEditConnectionRequest,
  z.infer<typeof zToBackendEditConnectionRequest>
>({ value: true });
