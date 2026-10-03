import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OptionsPrestoTrinoCommon,
  zOptionsPrestoTrinoCommon
} from '#common/types/backend/parts/connection-parts/options-presto-trino-common';
import type { Extend } from '#common/types/extend';

export type OptionsPresto = Extend<
  OptionsPrestoTrinoCommon,
  { port?: number; internalPort?: number }
>;

export let zOptionsPresto = zOptionsPrestoTrinoCommon
  .extend({
    port: z.number().int().nullish(),
    internalPort: z.number().int().nullish()
  })
  .meta({ id: 'OptionsPresto' });

assertTypesEqual<OptionsPresto, z.infer<typeof zOptionsPresto>>({
  value: true
});
