import { z } from 'zod';
import { FractionLogicEnum } from '#common/enums/fraction/fraction-logic.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileStoreFractionControl,
  zFileStoreFractionControl
} from '#common/types/blockml/parts/internal/file-store-fraction-control';
import type { EnumValues } from '#common/types/enum-values';

export type FileStoreFractionType = {
  type?: string;
  type_line_num?: number;
  label?: string;
  label_line_num?: number;
  meta?: any;
  meta_line_num?: number;
  controls?: FileStoreFractionControl[];
  controls_line_num?: number;
  logicGroup?: EnumValues<typeof FractionLogicEnum>;
};

export let zFileStoreFractionType = z
  .object({
    type: z.string().nullish(),
    type_line_num: z.number().nullish(),
    label: z.string().nullish(),
    label_line_num: z.number().nullish(),
    meta: z.any().nullish(),
    meta_line_num: z.number().nullish(),
    controls: z.array(zFileStoreFractionControl).nullish(),
    controls_line_num: z.number().nullish(),
    logicGroup: z.enum(FractionLogicEnum).nullish()
  })
  .meta({ id: 'FileStoreFractionType' });

assertTypesEqual<FileStoreFractionType, z.infer<typeof zFileStoreFractionType>>(
  { value: true }
);
