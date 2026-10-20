import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcEventEntToTabError,
  zOcEventEntToTabError
} from '#common/types/backend/function-errors/oc-event-ent-to-tab-error';

export type DbOcEventsFindManyError = OcEventEntToTabError;

export let zDbOcEventsFindManyError = zOcEventEntToTabError;

assertTypesEqual<
  DbOcEventsFindManyError,
  z.infer<typeof zDbOcEventsFindManyError>
>({
  value: true
});
