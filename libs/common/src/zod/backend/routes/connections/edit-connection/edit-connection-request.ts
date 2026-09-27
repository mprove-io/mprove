import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/zod/backend/connection-parts/connection-options';

export type ToBackendEditConnectionInput = {
  projectId: string;
  envId: string;
  connectionId: string;
  options?: ConnectionOptions;
};

export type ToBackendEditConnectionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditConnectionInput;
};

export let zToBackendEditConnectionInput = z
  .object({
    projectId: z.string(),
    envId: z.string(),
    connectionId: z.string(),
    options: zConnectionOptions.nullish()
  })
  .meta({ id: 'ToBackendEditConnectionInput' });

export let zToBackendEditConnectionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditConnectionInput
  })
  .meta({ id: 'ToBackendEditConnectionRequest' });

assertTypesEqual<
  ToBackendEditConnectionInput,
  z.infer<typeof zToBackendEditConnectionInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditConnectionRequest,
  z.infer<typeof zToBackendEditConnectionRequest>
>({ value: true });
