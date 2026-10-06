import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const queryStatusValues = [
  'New',
  'Running',
  'Canceled',
  'Completed',
  'Error'
] as const;

export type QueryStatus = (typeof queryStatusValues)[number];

export let zQueryStatus = z.enum(queryStatusValues);

assertTypesEqual<QueryStatus, z.infer<typeof zQueryStatus>>({
  value: true
});
