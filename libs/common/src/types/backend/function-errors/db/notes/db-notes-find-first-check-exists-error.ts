import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendNoteDoesNotExistError,
  zBackendNoteDoesNotExistError
} from '#common/types/backend/errors/backend-note-does-not-exist-error';
import {
  type NoteEntToTabError,
  zNoteEntToTabError
} from '#common/types/backend/function-errors/note-ent-to-tab-error';

export type DbNotesFindFirstCheckExistsError =
  | NoteEntToTabError
  | BackendNoteDoesNotExistError;

export let zDbNotesFindFirstCheckExistsError = z.union([
  zNoteEntToTabError,
  zBackendNoteDoesNotExistError
]);

assertTypesEqual<
  DbNotesFindFirstCheckExistsError,
  z.infer<typeof zDbNotesFindFirstCheckExistsError>
>({
  value: true
});
