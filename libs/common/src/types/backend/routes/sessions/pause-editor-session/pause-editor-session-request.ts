import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendPauseEditorSessionRequest = {
  operation: 'pauseEditorSession';
  traceId: string;
  idempotencyKey: string;
  input: {
    sessionId: string;
  };
};

export let zToBackendPauseEditorSessionRequest = z
  .strictObject({
    operation: z.literal('pauseEditorSession'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        sessionId: z.string()
      })
      .meta({ id: 'ToBackendPauseEditorSessionInput' })
  })
  .meta({ id: 'ToBackendPauseEditorSessionRequest' });

assertTypesEqual<
  ToBackendPauseEditorSessionRequest,
  z.infer<typeof zToBackendPauseEditorSessionRequest>
>({ value: true });
