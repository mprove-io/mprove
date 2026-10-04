import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionType,
  zConnectionType
} from '#common/types/backend/parts/connection-parts/connection-type';

export type BaseConnection = {
  projectId?: string;
  connectionId?: string;
  envId?: string;
  type?: ConnectionType;
  st: string;
  lt: string;
};

export let zBaseConnection = z
  .object({
    projectId: z.string().nullish(),
    connectionId: z.string().nullish(),
    envId: z.string().nullish(),
    type: zConnectionType.nullish(),
    st: z.string(),
    lt: z.string()
  })
  .meta({ id: 'BaseConnection' });

assertTypesEqual<BaseConnection, z.infer<typeof zBaseConnection>>({
  value: true
});
