import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type OcMessageEntToTabError = GetTabPropsError;

export let zOcMessageEntToTabError = zGetTabPropsError;

assertTypesEqual<
  OcMessageEntToTabError,
  z.infer<typeof zOcMessageEntToTabError>
>({ value: true });
