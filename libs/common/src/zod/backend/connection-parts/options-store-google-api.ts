import { z } from 'zod';
import { zApiHeader } from '#common/zod/backend/connection-parts/api-header';

export let zOptionsStoreGoogleApi = z
  .object({
    headers: z.array(zApiHeader).nullish(),
    baseUrl: z.string().nullish(),
    googleAuthScopes: z.array(z.string()).nullish(),
    serviceAccountCredentials: z.any().nullish(),
    googleCloudProject: z.string().nullish(),
    googleCloudClientEmail: z.string().nullish(),
    googleAccessToken: z.string().nullish(),
    googleAccessTokenExpiryDate: z.number().nullish()
  })
  .meta({ id: 'OptionsStoreGoogleApi' });

export type OptionsStoreGoogleApi = z.infer<typeof zOptionsStoreGoogleApi>;
