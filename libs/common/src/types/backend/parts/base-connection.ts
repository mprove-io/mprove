import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type BaseConnection = {
  projectId?: string;
  connectionId?: string;
  envId?: string;
  type?: EnumValues<typeof ConnectionTypeEnum>;
  st: string;
  lt: string;
};

export let zBaseConnection = z
  .object({
    projectId: z.string().nullish(),
    connectionId: z.string().nullish(),
    envId: z.string().nullish(),
    type: z.enum(ConnectionTypeEnum).nullish(),
    st: z.string(),
    lt: z.string()
  })
  .meta({ id: 'BaseConnection' });

assertTypesEqual<BaseConnection, z.infer<typeof zBaseConnection>>({
  value: true
});
