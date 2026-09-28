import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendTestRoutesForbiddenError = {
  code: 'BACKEND_TEST_ROUTES_FORBIDDEN';
};

export let zBackendTestRoutesForbiddenError = z.object({
  code: z.literal('BACKEND_TEST_ROUTES_FORBIDDEN')
});

assertTypesEqual<
  BackendTestRoutesForbiddenError,
  z.infer<typeof zBackendTestRoutesForbiddenError>
>({ value: true });
