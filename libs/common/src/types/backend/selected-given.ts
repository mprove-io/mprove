import { z } from 'zod';
import { GivenTypeEnum } from '#common/enums/given-type.enum';

export let zSelectedGiven = z
  .object({
    givenId: z.string(),
    type: z.enum(GivenTypeEnum),
    isMultiple: z.boolean(),
    values: z.array(z.string())
  })
  .meta({ id: 'SelectedGiven' });

export type SelectedGiven = z.infer<typeof zSelectedGiven>;
