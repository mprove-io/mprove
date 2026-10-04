import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const queryPartValues = [
  'JsonAppliedGivens',
  'MalloyQuery',
  'MalloyCompiledQuery',
  'JsonStoreRequestParts',
  'JavascriptStoreRequestFunction',
  'SqlMalloy',
  'SqlMain',
  'YamlTile',
  'YamlModel',
  'MalloySource',
  'YamlStore',
  'JsonResults'
] as const;

export type QueryPart = (typeof queryPartValues)[number];

export let zQueryPart = z.enum(queryPartValues);

assertTypesEqual<QueryPart, z.infer<typeof zQueryPart>>({
  value: true
});
