import { z } from 'zod';

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

export let zMcpToolGetSampleOutput = z
  .object({
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'McpToolGetSampleOutput' });

export type McpToolGetSampleInput = z.infer<typeof zMcpToolGetSampleInput>;

export type McpToolGetSampleOutput = z.infer<typeof zMcpToolGetSampleOutput>;
