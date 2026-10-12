import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SelectUnselectedGivensError,
  zSelectUnselectedGivensError
} from '#common/types/backend/function-errors/select-unselected-givens-error';

export type GetSelectedGivensError = SelectUnselectedGivensError;

export const zGetSelectedGivensError = zSelectUnselectedGivensError;

assertTypesEqual<
  GetSelectedGivensError,
  z.infer<typeof zGetSelectedGivensError>
>({ value: true });
