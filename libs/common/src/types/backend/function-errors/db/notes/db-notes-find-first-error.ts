import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type NoteEntToTabError,
  zNoteEntToTabError
} from '#common/types/backend/function-errors/note-ent-to-tab-error';

export type DbNotesFindFirstError = NoteEntToTabError;

export let zDbNotesFindFirstError = zNoteEntToTabError;

assertTypesEqual<DbNotesFindFirstError, z.infer<typeof zDbNotesFindFirstError>>(
  {
    value: true
  }
);
