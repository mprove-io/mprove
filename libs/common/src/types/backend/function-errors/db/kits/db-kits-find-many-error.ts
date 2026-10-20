import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type KitEntToTabError,
  zKitEntToTabError
} from '#common/types/backend/function-errors/kit-ent-to-tab-error';

export type DbKitsFindManyError = KitEntToTabError;

export let zDbKitsFindManyError = zKitEntToTabError;

assertTypesEqual<DbKitsFindManyError, z.infer<typeof zDbKitsFindManyError>>({
  value: true
});
