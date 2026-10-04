import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GivenType,
  zGivenType
} from '#common/types/backend/parts/given/given-type';

export type Given = {
  projectId: string;
  givenId: string;
  type: GivenType;
  isMultiple: boolean;
  values: string[];
};

export let zGiven = z
  .object({
    projectId: z.string(),
    givenId: z.string(),
    type: zGivenType,
    isMultiple: z.boolean(),
    values: z.array(z.string())
  })
  .meta({ id: 'Given' });

assertTypesEqual<Given, z.infer<typeof zGiven>>({ value: true });
