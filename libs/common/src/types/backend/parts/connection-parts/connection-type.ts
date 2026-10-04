import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const connectionTypeValues = [
  'PostgreSQL',
  'MySQL',
  // ClickHouse = 'ClickHouse',
  'SnowFlake',
  'BigQuery',
  'Databricks',
  'MotherDuck',
  'Presto',
  'Trino',
  'GoogleApi',
  'Api'
] as const;

export type ConnectionType = (typeof connectionTypeValues)[number];

export let zConnectionType = z.enum(connectionTypeValues);

assertTypesEqual<ConnectionType, z.infer<typeof zConnectionType>>({
  value: true
});
