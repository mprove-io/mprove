import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const builderLeftValues = [
  'Tree',
  'ChangesToCommit',
  'ChangesToPush',
  'Info'
] as const;

export type BuilderLeft = (typeof builderLeftValues)[number];

export let zBuilderLeft = z.enum(builderLeftValues);

assertTypesEqual<BuilderLeft, z.infer<typeof zBuilderLeft>>({
  value: true
});
