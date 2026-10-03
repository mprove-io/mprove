import { z } from 'zod';
import { GivenTypeEnum } from '#common/enums/given-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type SelectedGiven = {
  givenId: string;
  type: EnumValues<typeof GivenTypeEnum>;
  isMultiple: boolean;
  values: string[];
};

export let zSelectedGiven = z
  .object({
    givenId: z.string(),
    type: z.enum(GivenTypeEnum),
    isMultiple: z.boolean(),
    values: z.array(z.string())
  })
  .meta({ id: 'SelectedGiven' });

assertTypesEqual<SelectedGiven, z.infer<typeof zSelectedGiven>>({
  value: true
});
