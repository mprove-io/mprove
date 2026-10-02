import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolGetSampleInput = {
  projectId: string;
  envId: string;
  connectionId: string;
  schemaName: string;
  tableName: string;
  columnName?: string;
  offset?: number;
};

export let zMcpToolGetSampleInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    envId: z.string().describe('Environment ID'),
    connectionId: z.string().describe('Connection ID'),
    schemaName: z.string().describe('Database schema name'),
    tableName: z.string().describe('Database table name'),
    columnName: z
      .string()
      .nullish()
      .describe(
        'Column name to sample. Omit to get all columns from the table.'
      ),
    offset: z
      .number()
      .int()
      .min(0)
      .nullish()
      .describe('Row offset for pagination. Omit to start from the first row.')
  })
  .meta({ id: 'McpToolGetSampleInput' });

assertTypesEqual<McpToolGetSampleInput, z.infer<typeof zMcpToolGetSampleInput>>(
  { value: true }
);
