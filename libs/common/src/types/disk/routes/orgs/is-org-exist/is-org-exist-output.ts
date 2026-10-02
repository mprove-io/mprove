import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToDiskIsOrgExistOutput = {
  orgId: string;
  isOrgExist: boolean;
};

export let zToDiskIsOrgExistOutput = z
  .object({ orgId: z.string(), isOrgExist: z.boolean() })
  .meta({ id: 'ToDiskIsOrgExistOutput' });

assertTypesEqual<
  ToDiskIsOrgExistOutput,
  z.infer<typeof zToDiskIsOrgExistOutput>
>({ value: true });
