import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';

export let zConnectionItem = z.object({
  connectionId: z.string().nullish(),
  type: z.enum(ConnectionTypeEnum).nullish(),
  baseUrl: z.string().nullish(),
  headerKeys: z.array(z.string()).nullish(),
  googleAuthScopes: z.array(z.string()).nullish()
});
