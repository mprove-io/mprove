import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

const toBlockmlOperations = ['rebuildStruct'] as const;

export type ToBlockmlOperation = (typeof toBlockmlOperations)[number];

export let zToBlockmlOperation = z.enum(toBlockmlOperations);

assertTypesEqual<ToBlockmlOperation, z.infer<typeof zToBlockmlOperation>>({
  value: true
});
