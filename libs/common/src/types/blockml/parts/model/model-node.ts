import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FieldClass,
  zFieldClass
} from '#common/types/blockml/parts/field/field-class';
import {
  type FieldResult,
  zFieldResult
} from '#common/types/blockml/parts/field/field-result';

export type ModelNode = {
  id: string;
  label: string;
  description?: string;
  nodeClass: FieldClass;
  viewName?: string;
  isField: boolean;
  fieldFileName?: string;
  viewFilePath?: string;
  fieldFilePath?: string;
  fieldResult?: FieldResult;
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
    nodeClass: zFieldClass,
    viewName: z.string().nullish(),
    isField: z.boolean(),
    fieldFileName: z.string().nullish(),
    viewFilePath: z.string().nullish(),
    fieldFilePath: z.string().nullish(),
    fieldResult: zFieldResult.nullish(),
    fieldLineNum: z.number().int().nullish(),
    hidden: z.boolean(),
    required: z.boolean(),
    get children() {
      return z.array(zModelNode).nullish();
    }
  })
  .meta({ id: 'ModelNode' });

assertTypesEqual<ModelNode, z.infer<typeof zModelNode>>({ value: true });
