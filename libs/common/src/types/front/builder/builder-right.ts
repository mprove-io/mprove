import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const builderRightValues = [
  'Sessions',
  'Schema',
  'Validation',
  'File'
] as const;

export type BuilderRight = (typeof builderRightValues)[number];

export let zBuilderRight = z.enum(builderRightValues);

assertTypesEqual<BuilderRight, z.infer<typeof zBuilderRight>>({
  value: true
});
