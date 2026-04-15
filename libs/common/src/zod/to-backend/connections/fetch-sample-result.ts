import { z } from 'zod';

export let zFetchSampleResult = z
  .object({
    columnNames: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'FetchSampleResult' });

export type FetchSampleResult = z.infer<typeof zFetchSampleResult>;
