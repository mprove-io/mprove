import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';

export let zModelNode: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().nullish(),
    label: z.string().nullish(),
    description: z.string().nullish(),
    nodeClass: z.enum(FieldClassEnum).nullish(),
    viewName: z.string().nullish(),
    isField: z.boolean().nullish(),
    fieldFileName: z.string().nullish(),
    viewFilePath: z.string().nullish(),
    fieldFilePath: z.string().nullish(),
    fieldResult: z.enum(FieldResultEnum).nullish(),
    fieldLineNum: z.number().nullish(),
    hidden: z.boolean().nullish(),
    required: z.boolean().nullish(),
    children: z.array(zModelNode).nullish()
  })
);
