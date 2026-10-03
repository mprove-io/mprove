import { z } from 'zod';
import { GivenTypeEnum } from '#common/enums/given-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type Given = {
  projectId: string;
  givenId: string;
  type: EnumValues<typeof GivenTypeEnum>;
  isMultiple: boolean;
  values: string[];
};

export let zGiven = z
  .object({
    projectId: z.string(),
    givenId: z.string(),
    type: z.enum(GivenTypeEnum),
    isMultiple: z.boolean(),
    values: z.array(z.string())
  })
  .meta({ id: 'Given' });

assertTypesEqual<Given, z.infer<typeof zGiven>>({ value: true });
