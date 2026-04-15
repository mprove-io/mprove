import { z } from 'zod';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { zFraction } from '#common/zod/blockml/fraction';
import { zFileFraction } from '#common/zod/blockml/internal/file-fraction';

export let zFileReportRowParameter = z
  .object({
    apply_to: z.string().nullish(),
    apply_to_line_num: z.number().nullish(),
    listen: z.string().nullish(),
    listen_line_num: z.number().nullish(),
    conditions: z.array(z.string()).nullish(),
    conditions_line_num: z.number().nullish(),
    fractions: z.array(zFileFraction).nullish(),
    fractions_line_num: z.number().nullish(),
    apiFractions: z.array(zFraction).nullish(),
    notStoreApplyToResult: z.enum(FieldResultEnum).nullish()
  })
  .meta({ id: 'FileReportRowParameter' });

export type FileReportRowParameter = z.infer<typeof zFileReportRowParameter>;
