import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const fieldResultValues = [
  'day_of_week',
  'day_of_week_index',
  'month_name',
  'quarter_of_year',
  'ts',
  'yesno',
  //
  'string',
  'number',
  //
  'date',
  'boolean',
  'array',
  'record',
  'json',
  'sql_native'
] as const;

export type FieldResult = (typeof fieldResultValues)[number];

export let zFieldResult = z.enum(fieldResultValues);

assertTypesEqual<FieldResult, z.infer<typeof zFieldResult>>({
  value: true
});
