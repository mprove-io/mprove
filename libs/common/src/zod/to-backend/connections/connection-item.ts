import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';

export let zConnectionItem = z
  .object({
    connectionId: z.string(),
    type: z.enum(ConnectionTypeEnum),
    baseUrl: z.string().optional(),
    headerKeys: z.array(z.string()).optional(),
    googleAuthScopes: z.array(z.string()).optional()
  })
  .meta({ id: 'ConnectionItem' });

export type ZConnectionItem = z.infer<typeof zConnectionItem>;
