import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSpecialRebuildStructsOutput,
  zToBackendSpecialRebuildStructsOutput
} from '#common/zod/backend/routes/special/special-rebuild-structs/special-rebuild-structs-output';
import {
  type ToBackendSpecialRebuildStructsError,
  zToBackendSpecialRebuildStructsError
} from './special-rebuild-structs-error';

export type ToBackendSpecialRebuildStructsResponse = ToBackendResponseBase<
  'specialRebuildStructs',
  ToBackendSpecialRebuildStructsOutput,
  ToBackendSpecialRebuildStructsError
>;

export let zToBackendSpecialRebuildStructsResponse =
  makeToBackendResponseSchema({
    operation: 'specialRebuildStructs',
    output: zToBackendSpecialRebuildStructsOutput,
    error: zToBackendSpecialRebuildStructsError
  }).meta({ id: 'ToBackendSpecialRebuildStructsResponse' });

assertTypesEqual<
  ToBackendSpecialRebuildStructsResponse,
  z.infer<typeof zToBackendSpecialRebuildStructsResponse>
>({ value: true });
