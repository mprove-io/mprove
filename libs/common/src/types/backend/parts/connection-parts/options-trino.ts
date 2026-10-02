import { z } from 'zod';
import { zOptionsPrestoTrinoCommon } from '#common/types/backend/parts/connection-parts/options-presto-trino-common';

export let zOptionsTrino = zOptionsPrestoTrinoCommon
  .extend({})
  .meta({ id: 'OptionsTrino' });

export type OptionsTrino = z.infer<typeof zOptionsTrino>;
