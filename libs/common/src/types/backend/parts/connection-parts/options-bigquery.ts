import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OptionsBigquery = {
  serviceAccountCredentials?: any;
  googleCloudProject?: string;
  googleCloudClientEmail?: string;
  bigqueryQuerySizeLimitGb?: number;
};

export let zOptionsBigquery = z
  .object({
    serviceAccountCredentials: z.any().nullish(),
    googleCloudProject: z.string().nullish(),
    googleCloudClientEmail: z.string().nullish(),
    bigqueryQuerySizeLimitGb: z.number().int().nullish()
  })
  .meta({ id: 'OptionsBigquery' });

assertTypesEqual<OptionsBigquery, z.infer<typeof zOptionsBigquery>>({
  value: true
});
