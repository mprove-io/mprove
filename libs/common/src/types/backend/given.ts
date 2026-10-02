import { z } from 'zod';
import { GivenTypeEnum } from '#common/enums/given-type.enum';

export let zGiven = z
  .object({
    projectId: z.string(),
    givenId: z.string(),
    type: z.enum(GivenTypeEnum),
    isMultiple: z.boolean(),
    values: z.array(z.string())
  })
  .meta({ id: 'Given' });

export type Given = z.infer<typeof zGiven>;
