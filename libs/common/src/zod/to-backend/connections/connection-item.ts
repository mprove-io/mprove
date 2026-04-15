import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';

export let zConnectionItem = z
  .object({
    connectionId: z.string(),
    type: z.enum(ConnectionTypeEnum),
    baseUrl: z.string().nullish(),
    headerKeys: z.array(z.string()).nullish(),
    googleAuthScopes: z.array(z.string()).nullish()
  })
  .meta({ id: 'ConnectionItem' });

export type ConnectionItem = z.infer<typeof zConnectionItem>;
