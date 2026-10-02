import { z } from 'zod';

export let zOptionsBigquery = z
  .object({
    serviceAccountCredentials: z.any().nullish(),
    googleCloudProject: z.string().nullish(),
    googleCloudClientEmail: z.string().nullish(),
    bigqueryQuerySizeLimitGb: z.number().int().nullish()
  })
  .meta({ id: 'OptionsBigquery' });

export type OptionsBigquery = z.infer<typeof zOptionsBigquery>;
