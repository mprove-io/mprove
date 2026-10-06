import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const changeTypeValues = [
  'AddEmpty',
  'AddMetric',
  'AddHeader',
  'AddFormula',
  'EditInfo',
  'EditChart',
  'EditFormula',
  'EditParameters',
  'EditListeners',
  'Delete',
  'Move'
] as const;

export type ChangeType = (typeof changeTypeValues)[number];

export let zChangeType = z.enum(changeTypeValues);

assertTypesEqual<ChangeType, z.infer<typeof zChangeType>>({
  value: true
});
