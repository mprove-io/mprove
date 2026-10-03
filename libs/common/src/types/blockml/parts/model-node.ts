import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type ModelNode = {
  id: string;
  label: string;
  description?: string;
  nodeClass: EnumValues<typeof FieldClassEnum>;
  viewName?: string;
  isField: boolean;
  fieldFileName?: string;
  viewFilePath?: string;
  fieldFilePath?: string;
  fieldResult?: EnumValues<typeof FieldResultEnum>;
  fieldLineNum?: number;
  hidden: boolean;
  required: boolean;
  children?: ModelNode[];
};

export let zModelNode = z
  .object({
    id: z.string(),
    label: z.string(),
    description: z.string().nullish(),
    nodeClass: z.enum(FieldClassEnum),
    viewName: z.string().nullish(),
    isField: z.boolean(),
    fieldFileName: z.string().nullish(),
    viewFilePath: z.string().nullish(),
    fieldFilePath: z.string().nullish(),
    fieldResult: z.enum(FieldResultEnum).nullish(),
    fieldLineNum: z.number().int().nullish(),
    hidden: z.boolean(),
    required: z.boolean(),
    get children() {
      return z.array(zModelNode).nullish();
    }
  })
  .meta({ id: 'ModelNode' });

assertTypesEqual<ModelNode, z.infer<typeof zModelNode>>({ value: true });
