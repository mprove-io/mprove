import { z } from 'zod';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Fraction, zFraction } from '#common/types/blockml/parts/fraction';
import {
  type FileFraction,
  zFileFraction
} from '#common/types/blockml/parts/internal/file-fraction';
import type { EnumValues } from '#common/types/enum-values';

export type FileReportRowParameter = {
  apply_to?: string;
  apply_to_line_num?: number;
  listen?: string;
  listen_line_num?: number;
  conditions?: string[];
  conditions_line_num?: number;
  fractions?: FileFraction[];
  fractions_line_num?: number;
  apiFractions?: Fraction[];
  notStoreApplyToResult?: EnumValues<typeof FieldResultEnum>;
};

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

assertTypesEqual<
  FileReportRowParameter,
  z.infer<typeof zFileReportRowParameter>
>({ value: true });
