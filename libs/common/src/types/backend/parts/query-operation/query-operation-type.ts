import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const queryOperationTypeValues = [
  'Get',
  'WhereOrHaving',
  'GroupOrAggregate',
  'GroupOrAggregatePlusSort',
  'Limit',
  'Sort',
  'Move',
  'Remove',
  'Replace'
] as const;

export type QueryOperationType = (typeof queryOperationTypeValues)[number];

export let zQueryOperationType = z.enum(queryOperationTypeValues);

assertTypesEqual<QueryOperationType, z.infer<typeof zQueryOperationType>>({
  value: true
});
