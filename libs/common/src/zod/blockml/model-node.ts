import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';

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

export type ModelNode = z.infer<typeof zModelNode>;
