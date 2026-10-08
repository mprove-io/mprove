import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type ProjectEntToTabResultError = GetTabPropsResultError;

export let zProjectEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  ProjectEntToTabResultError,
  z.infer<typeof zProjectEntToTabResultError>
>({ value: true });
