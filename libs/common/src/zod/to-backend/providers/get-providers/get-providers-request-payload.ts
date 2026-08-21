import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToBackendGetProvidersRequestPayload = {
  projectId: string;
};

export let zToBackendGetProvidersRequestPayload = z
  .object({ projectId: z.string() })
  .meta({ id: 'ToBackendGetProvidersRequestPayload' });

assertTypesEqual<
  ToBackendGetProvidersRequestPayload,
  z.infer<typeof zToBackendGetProvidersRequestPayload>
>({ value: true });
