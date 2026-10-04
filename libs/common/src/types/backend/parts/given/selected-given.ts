import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GivenType,
  zGivenType
} from '#common/types/backend/parts/given/given-type';

export type SelectedGiven = {
  givenId: string;
  type: GivenType;
  isMultiple: boolean;
  values: string[];
};

export let zSelectedGiven = z
  .object({
    givenId: z.string(),
    type: zGivenType,
    isMultiple: z.boolean(),
    values: z.array(z.string())
  })
  .meta({ id: 'SelectedGiven' });

assertTypesEqual<SelectedGiven, z.infer<typeof zSelectedGiven>>({
  value: true
});
