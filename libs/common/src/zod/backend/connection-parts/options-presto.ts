import { z } from 'zod';
import { zOptionsPrestoTrinoCommon } from '#common/zod/backend/connection-parts/options-presto-trino-common';

export let zOptionsPresto = zOptionsPrestoTrinoCommon
  .extend({
    port: z.number().int().nullish(),
    internalPort: z.number().int().nullish()
  })
  .meta({ id: 'OptionsPresto' });

export type OptionsPresto = z.infer<typeof zOptionsPresto>;
