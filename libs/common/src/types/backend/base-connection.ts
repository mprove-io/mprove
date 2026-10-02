import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';

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

export type BaseConnection = z.infer<typeof zBaseConnection>;
