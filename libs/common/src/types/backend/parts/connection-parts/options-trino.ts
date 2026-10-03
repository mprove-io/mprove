import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OptionsPrestoTrinoCommon,
  zOptionsPrestoTrinoCommon
} from '#common/types/backend/parts/connection-parts/options-presto-trino-common';
import type { Extend } from '#common/types/extend';

export type OptionsTrino = Extend<OptionsPrestoTrinoCommon, {}>;

export let zOptionsTrino = zOptionsPrestoTrinoCommon
  .extend({})
  .meta({ id: 'OptionsTrino' });

assertTypesEqual<OptionsTrino, z.infer<typeof zOptionsTrino>>({ value: true });
