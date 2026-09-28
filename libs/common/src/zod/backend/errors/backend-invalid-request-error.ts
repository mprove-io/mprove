import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendInvalidRequestError = {
  code: 'BACKEND_INVALID_REQUEST';
  displayData: { path: string; message: string; code: string }[];
};

export let zBackendInvalidRequestError = z.object({
  code: z.literal('BACKEND_INVALID_REQUEST'),
  displayData: z.array(
    z.object({
      path: z.string(),
      message: z.string(),
      code: z.string()
    })
  )
});

assertTypesEqual<
  BackendInvalidRequestError,
  z.infer<typeof zBackendInvalidRequestError>
>({ value: true });
