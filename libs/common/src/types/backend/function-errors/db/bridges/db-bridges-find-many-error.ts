import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BridgeEntToTabError,
  zBridgeEntToTabError
} from '#common/types/backend/function-errors/bridge-ent-to-tab-error';

export type DbBridgesFindManyError = BridgeEntToTabError;

export let zDbBridgesFindManyError = zBridgeEntToTabError;

assertTypesEqual<
  DbBridgesFindManyError,
  z.infer<typeof zDbBridgesFindManyError>
>({
  value: true
});
