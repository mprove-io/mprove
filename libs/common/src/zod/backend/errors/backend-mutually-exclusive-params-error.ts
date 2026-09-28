import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMutuallyExclusiveParamsError = {
  code: 'BACKEND_MUTUALLY_EXCLUSIVE_PARAMS';
  displayData?: string;
};

export let zBackendMutuallyExclusiveParamsError = z.object({
  code: z.literal('BACKEND_MUTUALLY_EXCLUSIVE_PARAMS'),
  displayData: z.string().nullish()
});

assertTypesEqual<
  BackendMutuallyExclusiveParamsError,
  z.infer<typeof zBackendMutuallyExclusiveParamsError>
>({ value: true });
