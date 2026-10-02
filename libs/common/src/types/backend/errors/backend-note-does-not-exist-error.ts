import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendNoteDoesNotExistError = {
  code: 'BACKEND_NOTE_DOES_NOT_EXIST';
};

export let zBackendNoteDoesNotExistError = z.object({
  code: z.literal('BACKEND_NOTE_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendNoteDoesNotExistError,
  z.infer<typeof zBackendNoteDoesNotExistError>
>({ value: true });
