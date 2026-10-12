import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type NoteEntToTabError = GetTabPropsError;

export let zNoteEntToTabError = zGetTabPropsError;

assertTypesEqual<NoteEntToTabError, z.infer<typeof zNoteEntToTabError>>({
  value: true
});
