import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Model, zModel } from '#common/types/blockml/parts/model';

export type McpToolGetModelOutput = {
  needValidate: boolean;
  model: Model;
};

export let zMcpToolGetModelOutput = z
  .object({
    needValidate: z.boolean(),
    model: zModel
  })
  .meta({ id: 'McpToolGetModelOutput' });

assertTypesEqual<McpToolGetModelOutput, z.infer<typeof zMcpToolGetModelOutput>>(
  { value: true }
);
