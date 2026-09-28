import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ToBlockmlRebuildStructOutput,
  zToBlockmlRebuildStructOutput
} from '#common/zod/blockml/routes/rebuild-struct/rebuild-struct-output';

export type ToBackendGetRebuildStructOutput = ToBlockmlRebuildStructOutput;

export let zToBackendGetRebuildStructOutput = zToBlockmlRebuildStructOutput;

assertTypesEqual<
  ToBackendGetRebuildStructOutput,
  z.infer<typeof zToBackendGetRebuildStructOutput>
>({ value: true });
