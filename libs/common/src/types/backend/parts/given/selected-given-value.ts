import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SelectedGivenPrimitive,
  zSelectedGivenPrimitive
} from '#common/types/backend/parts/given/selected-given-primitive';

export type SelectedGivenValue =
  | SelectedGivenPrimitive
  | SelectedGivenPrimitive[];

export let zSelectedGivenValue = z.union([
  zSelectedGivenPrimitive,
  z.array(zSelectedGivenPrimitive)
]);

assertTypesEqual<SelectedGivenValue, z.infer<typeof zSelectedGivenValue>>({
  value: true
});
