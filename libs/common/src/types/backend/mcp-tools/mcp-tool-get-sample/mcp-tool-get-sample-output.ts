import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolGetSampleOutput = {
  columnNames: string[];
  rows: string[][];
  errorMessage?: string;
};

export let zMcpToolGetSampleOutput = z
  .object({
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'McpToolGetSampleOutput' });

assertTypesEqual<
  McpToolGetSampleOutput,
  z.infer<typeof zMcpToolGetSampleOutput>
>({ value: true });
