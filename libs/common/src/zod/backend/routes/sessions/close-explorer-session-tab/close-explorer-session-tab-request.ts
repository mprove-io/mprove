import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCloseExplorerSessionTabRequest = {
  operation: 'closeExplorerSessionTab';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
    closedExplorerTabIds: string[];
  };
};

export let zToBackendCloseExplorerSessionTabRequest = z
  .strictObject({
    operation: z.literal('closeExplorerSessionTab'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string(),
        closedExplorerTabIds: z.array(z.string())
      })
      .meta({ id: 'ToBackendCloseExplorerSessionTabInput' })
  })
  .meta({ id: 'ToBackendCloseExplorerSessionTabRequest' });

assertTypesEqual<
  ToBackendCloseExplorerSessionTabRequest,
  z.infer<typeof zToBackendCloseExplorerSessionTabRequest>
>({ value: true });
