import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type ConnectionEntToTabError = GetTabPropsError;

export let zConnectionEntToTabError = zGetTabPropsError;

assertTypesEqual<
  ConnectionEntToTabError,
  z.infer<typeof zConnectionEntToTabError>
>({ value: true });
