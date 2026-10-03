import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type FileStoreFractionControlOption = {
  value: string;
  value_line_num: number;
  label: string;
  label_line_num: number;
};

export let zFileStoreFractionControlOption = z
  .object({
    value: z.string(),
    value_line_num: z.number(),
    label: z.string(),
    label_line_num: z.number()
  })
  .meta({ id: 'FileStoreFractionControlOption' });

assertTypesEqual<
  FileStoreFractionControlOption,
  z.infer<typeof zFileStoreFractionControlOption>
>({ value: true });
