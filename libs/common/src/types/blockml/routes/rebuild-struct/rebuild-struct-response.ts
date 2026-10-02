import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBlockmlResponseSchema,
  type ToBlockmlResponseBase
} from '#common/types/blockml/response/to-blockml-response-base';
import {
  type ToBlockmlRebuildStructError,
  zToBlockmlRebuildStructError
} from './rebuild-struct-error';
import {
  type ToBlockmlRebuildStructOutput,
  zToBlockmlRebuildStructOutput
} from './rebuild-struct-output';

export type ToBlockmlRebuildStructResponse = ToBlockmlResponseBase<
  'rebuildStruct',
  ToBlockmlRebuildStructOutput,
  ToBlockmlRebuildStructError
>;

export let zToBlockmlRebuildStructResponse = makeToBlockmlResponseSchema({
  operation: 'rebuildStruct',
  output: zToBlockmlRebuildStructOutput,
  error: zToBlockmlRebuildStructError
});

assertTypesEqual<
  ToBlockmlRebuildStructResponse,
  z.infer<typeof zToBlockmlRebuildStructResponse>
>({ value: true });
