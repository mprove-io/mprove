import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import { zConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';

export type ConnectionItem = {
  connectionId: string;
  type: ConnectionType;
  baseUrl?: string;
  headerKeys?: string[];
  googleAuthScopes?: string[];
};

export let zConnectionItem = z
  .object({
    connectionId: z.string(),
    type: zConnectionType,
    baseUrl: z.string().nullish(),
    headerKeys: z.array(z.string()).nullish(),
    googleAuthScopes: z.array(z.string()).nullish()
  })
  .meta({ id: 'ConnectionItem' });

assertTypesEqual<ConnectionItem, z.infer<typeof zConnectionItem>>({
  value: true
});
