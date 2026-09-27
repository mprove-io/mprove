import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetProjectSandboxProviderInput = {
  projectId: string;
  e2bApiKey?: string;
};

export type ToBackendSetProjectSandboxProviderRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetProjectSandboxProviderInput;
};

export let zToBackendSetProjectSandboxProviderInput = z
  .object({
    projectId: z.string(),
    e2bApiKey: z.string().nullish()
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderInput' });

export let zToBackendSetProjectSandboxProviderRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetProjectSandboxProviderInput
  })
  .meta({ id: 'ToBackendSetProjectSandboxProviderRequest' });

assertTypesEqual<
  ToBackendSetProjectSandboxProviderInput,
  z.infer<typeof zToBackendSetProjectSandboxProviderInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetProjectSandboxProviderRequest,
  z.infer<typeof zToBackendSetProjectSandboxProviderRequest>
>({ value: true });
