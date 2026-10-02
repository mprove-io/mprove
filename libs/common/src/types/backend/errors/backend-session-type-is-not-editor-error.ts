import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendSessionTypeIsNotEditorError = {
  code: 'BACKEND_SESSION_TYPE_IS_NOT_EDITOR';
};

export let zBackendSessionTypeIsNotEditorError = z.object({
  code: z.literal('BACKEND_SESSION_TYPE_IS_NOT_EDITOR')
});

assertTypesEqual<
  BackendSessionTypeIsNotEditorError,
  z.infer<typeof zBackendSessionTypeIsNotEditorError>
>({ value: true });
