import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendPauseEditorSessionInput = {
  sessionId: string;
};

export type ToBackendPauseEditorSessionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendPauseEditorSessionInput;
};

export let zToBackendPauseEditorSessionInput = z
  .object({
    sessionId: z.string()
  })
  .meta({ id: 'ToBackendPauseEditorSessionInput' });

export let zToBackendPauseEditorSessionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendPauseEditorSessionInput
  })
  .meta({ id: 'ToBackendPauseEditorSessionRequest' });

assertTypesEqual<
  ToBackendPauseEditorSessionInput,
  z.infer<typeof zToBackendPauseEditorSessionInput>
>({ value: true });

assertTypesEqual<
  ToBackendPauseEditorSessionRequest,
  z.infer<typeof zToBackendPauseEditorSessionRequest>
>({ value: true });
