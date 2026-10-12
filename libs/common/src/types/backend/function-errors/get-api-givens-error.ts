import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GivenEntToTabError,
  zGivenEntToTabError
} from '#common/types/backend/function-errors/given-ent-to-tab-error';

export type GetApiGivensError = GivenEntToTabError;

export let zGetApiGivensError = zGivenEntToTabError;

assertTypesEqual<GetApiGivensError, z.infer<typeof zGetApiGivensError>>({
  value: true
});
