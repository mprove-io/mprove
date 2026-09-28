import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendViewCachedColumnOutput,
  zToBackendViewCachedColumnOutput
} from '#common/zod/backend/routes/connections/view-cached-column/view-cached-column-output';
import {
  type ToBackendViewCachedColumnError,
  zToBackendViewCachedColumnError
} from './view-cached-column-error';

export type ToBackendViewCachedColumnResponse = ToBackendResponseBase<
  'viewCachedColumn',
  ToBackendViewCachedColumnOutput,
  ToBackendViewCachedColumnError
>;

export let zToBackendViewCachedColumnResponse = makeToBackendResponseSchema({
  operation: 'viewCachedColumn',
  output: zToBackendViewCachedColumnOutput,
  error: zToBackendViewCachedColumnError
}).meta({ id: 'ToBackendViewCachedColumnResponse' });

assertTypesEqual<
  ToBackendViewCachedColumnResponse,
  z.infer<typeof zToBackendViewCachedColumnResponse>
>({ value: true });
