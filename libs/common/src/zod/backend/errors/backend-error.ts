import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendError = {
  message: string;
  name?: string;
  displayData?: any;
  customData?: any;
  originalError?: any;
};

export let zBackendError = z.object({
  message: z.string(),
  name: z.string().nullish(),
  displayData: z.any().nullish(),
  customData: z.any().nullish(),
  originalError: z.any().nullish()
});

assertTypesEqual<BackendError, z.infer<typeof zBackendError>>({ value: true });
