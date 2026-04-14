import { z } from 'zod';
import { FieldClassEnum } from '#common/enums/field-class.enum';
import { FieldResultEnum } from '#common/enums/field-result.enum';

export type ZModelNode = {
  id: string;
  label: string;
  description?: string;
  nodeClass: FieldClassEnum;
  viewName?: string;
  isField: boolean;
  fieldFileName?: string;
  viewFilePath?: string;
  fieldFilePath?: string;
  fieldResult?: FieldResultEnum;
  fieldLineNum?: number;
  hidden: boolean;
  required: boolean;
  children?: ZModelNode[];
};

export let zModelNode: z.ZodType<ZModelNode> = z.lazy(() =>
  z
    .object({
      id: z.string(),
      label: z.string(),
      description: z.string().optional(),
      nodeClass: z.enum(FieldClassEnum),
      viewName: z.string().optional(),
      isField: z.boolean(),
      fieldFileName: z.string().optional(),
      viewFilePath: z.string().optional(),
      fieldFilePath: z.string().optional(),
      fieldResult: z.enum(FieldResultEnum).optional(),
      fieldLineNum: z.number().int().optional(),
      hidden: z.boolean(),
      required: z.boolean(),
      children: z.array(zModelNode).optional()
    })
    .meta({ id: 'ModelNode' })
);
