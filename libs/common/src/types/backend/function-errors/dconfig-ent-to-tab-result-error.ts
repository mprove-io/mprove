import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsResultError,
  zGetTabPropsResultError
} from '#common/types/backend/function-errors/get-tab-props-result-error';

export type DconfigEntToTabResultError = GetTabPropsResultError;

export let zDconfigEntToTabResultError = zGetTabPropsResultError;

assertTypesEqual<
  DconfigEntToTabResultError,
  z.infer<typeof zDconfigEntToTabResultError>
>({ value: true });
