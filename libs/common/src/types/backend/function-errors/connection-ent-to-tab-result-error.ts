import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type ConnectionEntToTabResultError = GetTabPropsResultError;

export let zConnectionEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  ConnectionEntToTabResultError,
  z.infer<typeof zConnectionEntToTabResultError>
>({ value: true });
