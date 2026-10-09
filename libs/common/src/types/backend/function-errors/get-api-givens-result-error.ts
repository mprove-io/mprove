import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GivenEntToTabResultError,
  zGivenEntToTabResultError
} from '#common/types/backend/function-errors/given-ent-to-tab-result-error';

export type GetApiGivensResultError = GivenEntToTabResultError;

export let zGetApiGivensResultError = zGivenEntToTabResultError;

assertTypesEqual<
  GetApiGivensResultError,
  z.infer<typeof zGetApiGivensResultError>
>({ value: true });
