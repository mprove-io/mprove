import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCloseExplorerSessionTabInput = {
  sessionId: string;
  closedExplorerTabIds: string[];
};

export type ToBackendCloseExplorerSessionTabRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCloseExplorerSessionTabInput;
};

export let zToBackendCloseExplorerSessionTabInput = z
  .object({
    sessionId: z.string(),
    closedExplorerTabIds: z.array(z.string())
  })
  .meta({ id: 'ToBackendCloseExplorerSessionTabInput' });

export let zToBackendCloseExplorerSessionTabRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCloseExplorerSessionTabInput
  })
  .meta({ id: 'ToBackendCloseExplorerSessionTabRequest' });

assertTypesEqual<
  ToBackendCloseExplorerSessionTabInput,
  z.infer<typeof zToBackendCloseExplorerSessionTabInput>
>({ value: true });

assertTypesEqual<
  ToBackendCloseExplorerSessionTabRequest,
  z.infer<typeof zToBackendCloseExplorerSessionTabRequest>
>({ value: true });
