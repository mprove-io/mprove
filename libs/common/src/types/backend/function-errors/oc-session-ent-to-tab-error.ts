import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetTabPropsError,
  zGetTabPropsError
} from '#common/types/backend/function-errors/get-tab-props-error';

export type OcSessionEntToTabError = GetTabPropsError;

export let zOcSessionEntToTabError = zGetTabPropsError;

assertTypesEqual<
  OcSessionEntToTabError,
  z.infer<typeof zOcSessionEntToTabError>
>({ value: true });
