import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectSandboxProviderRequest = {
  operation: 'setProjectSandboxProvider';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    e2bApiKey?: string;
  };
};

export let zToBackendSetProjectSandboxProviderRequest = z
  .strictObject({
    operation: z.literal('setProjectSandboxProvider'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        e2bApiKey: z.string().nullish()
      })
      .meta({ id: 'ToBackendSetProjectSandboxProviderInput' })
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderRequest' });

assertTypesEqual<
  ToBackendSetProjectSandboxProviderRequest,
  z.infer<typeof zToBackendSetProjectSandboxProviderRequest>
>({ value: true });
