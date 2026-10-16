import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MakeMalloyQueryError,
  zMakeMalloyQueryError
} from '#common/types/node-common/function-errors/make-malloy-query-error';

export type ToBlockmlRebuildStructError = MakeMalloyQueryError;

export let zToBlockmlRebuildStructError = zMakeMalloyQueryError;

assertTypesEqual<
  ToBlockmlRebuildStructError,
  z.infer<typeof zToBlockmlRebuildStructError>
>({ value: true });
