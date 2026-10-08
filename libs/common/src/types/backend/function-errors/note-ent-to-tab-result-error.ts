import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type NoteEntToTabResultError = GetTabPropsResultError;

export let zNoteEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  NoteEntToTabResultError,
  z.infer<typeof zNoteEntToTabResultError>
>({ value: true });
