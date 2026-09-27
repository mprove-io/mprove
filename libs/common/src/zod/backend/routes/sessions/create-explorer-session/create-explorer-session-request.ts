import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCreateExplorerSessionInput = {
  projectId: string;
  repoId: string;
  providerId: string;
  modelId: string;
  variant: string;
  branchId: string;
  envId: string;
  firstMessage?: string;
  messageId: string;
  partId: string;
};

export type ToBackendCreateExplorerSessionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateExplorerSessionInput;
};

export let zToBackendCreateExplorerSessionInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    providerId: z.string(),
    modelId: z.string(),
    variant: z.string(),
    branchId: z.string(),
    envId: z.string(),
    firstMessage: z.string().nullish(),
    messageId: z.string(),
    partId: z.string()
  })
  .meta({ id: 'ToBackendCreateExplorerSessionInput' });

export let zToBackendCreateExplorerSessionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateExplorerSessionInput
  })
  .meta({ id: 'ToBackendCreateExplorerSessionRequest' });

assertTypesEqual<
  ToBackendCreateExplorerSessionInput,
  z.infer<typeof zToBackendCreateExplorerSessionInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateExplorerSessionRequest,
  z.infer<typeof zToBackendCreateExplorerSessionRequest>
>({ value: true });
