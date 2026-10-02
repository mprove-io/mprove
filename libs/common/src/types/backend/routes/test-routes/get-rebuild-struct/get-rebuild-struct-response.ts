import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetRebuildStructOutput,
  zToBackendGetRebuildStructOutput
} from '#common/types/backend/routes/test-routes/get-rebuild-struct/get-rebuild-struct-output';
import {
  type ToBackendGetRebuildStructError,
  zToBackendGetRebuildStructError
} from './get-rebuild-struct-error';

export type ToBackendGetRebuildStructResponse = ToBackendResponseBase<
  'getRebuildStruct',
  ToBackendGetRebuildStructOutput,
  ToBackendGetRebuildStructError
>;

export let zToBackendGetRebuildStructResponse = makeToBackendResponseSchema({
  operation: 'getRebuildStruct',
  output: zToBackendGetRebuildStructOutput,
  error: zToBackendGetRebuildStructError
}).meta({ id: 'ToBackendGetRebuildStructResponse' });

assertTypesEqual<
  ToBackendGetRebuildStructResponse,
  z.infer<typeof zToBackendGetRebuildStructResponse>
>({ value: true });
