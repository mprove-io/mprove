import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

// lowercase
const controlClassValues = [
  'list_input',
  'input',
  'switch',
  'date_picker',
  'selector'
] as const;

export type ControlClass = (typeof controlClassValues)[number];

export let zControlClass = z.enum(controlClassValues);

assertTypesEqual<ControlClass, z.infer<typeof zControlClass>>({
  value: true
});
