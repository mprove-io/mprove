import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type KitEntToTabError,
  zKitEntToTabError
} from '#common/types/backend/function-errors/kit-ent-to-tab-error';

export type DbKitsFindFirstError = KitEntToTabError;

export let zDbKitsFindFirstError = zKitEntToTabError;

assertTypesEqual<DbKitsFindFirstError, z.infer<typeof zDbKitsFindFirstError>>({
  value: true
});
