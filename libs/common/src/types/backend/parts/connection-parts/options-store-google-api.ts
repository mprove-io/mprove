import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ApiHeader,
  zApiHeader
} from '#common/types/backend/parts/connection-parts/api-header';

export type OptionsStoreGoogleApi = {
  headers?: ApiHeader[];
  baseUrl?: string;
  googleAuthScopes?: string[];
  serviceAccountCredentials?: any;
  googleCloudProject?: string;
  googleCloudClientEmail?: string;
  googleAccessToken?: string;
  googleAccessTokenExpiryDate?: number;
};

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

assertTypesEqual<OptionsStoreGoogleApi, z.infer<typeof zOptionsStoreGoogleApi>>(
  { value: true }
);
