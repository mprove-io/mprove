import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type NoteEntToTabError,
  zNoteEntToTabError
} from '#common/types/backend/function-errors/note-ent-to-tab-error';

export type DbNotesFindManyError = NoteEntToTabError;

export let zDbNotesFindManyError = zNoteEntToTabError;

assertTypesEqual<DbNotesFindManyError, z.infer<typeof zDbNotesFindManyError>>({
  value: true
});
