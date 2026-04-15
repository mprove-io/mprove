import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { zConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import { zConnectionRawSchema } from '#common/zod/backend/connection-schemas/raw-schema';

export let zProjectConnection = z
  .object({
    projectId: z.string().nullish(),
    connectionId: z.string().nullish(),
    envId: z.string().nullish(),
    type: z.enum(ConnectionTypeEnum).nullish(),
    options: zConnectionOptions.nullish(),
    rawSchema: zConnectionRawSchema.nullish(),
    serverTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectConnection' });

export type ProjectConnection = z.infer<typeof zProjectConnection>;
