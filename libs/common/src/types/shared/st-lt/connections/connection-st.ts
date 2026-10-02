import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';

export type ConnectionSt = {
  options: ConnectionOptions;
};

export let zConnectionSt = z
  .object({ options: zConnectionOptions })
  .meta({ id: 'ConnectionSt' });

assertTypesEqual<ConnectionSt, z.infer<typeof zConnectionSt>>({ value: true });
