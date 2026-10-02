import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CombinedSchemaItem,
  zCombinedSchemaItem
} from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-item';

export type McpToolGetSchemasOutput = {
  combinedSchemaItems: CombinedSchemaItem[];
};

export let zMcpToolGetSchemasOutput = z
  .object({
    combinedSchemaItems: z.array(zCombinedSchemaItem)
  })
  .meta({ id: 'McpToolGetSchemasOutput' });

assertTypesEqual<
  McpToolGetSchemasOutput,
  z.infer<typeof zMcpToolGetSchemasOutput>
>({ value: true });
