import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { zConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import { zConnectionRawSchema } from '#common/zod/backend/connection-schemas/raw-schema';

// TODO: `options` is tightened (non-nullish) despite interface `@IsOptional()`.
// Reason: makeMalloyConnections in libs/node-common dereferences
// x.options.<provider> directly without null guards. Loosen here only after
// that helper null-guards options.
export let zProjectConnection = z
  .object({
    projectId: z.string().nullish(),
    connectionId: z.string().nullish(),
    envId: z.string().nullish(),
    type: z.enum(ConnectionTypeEnum).nullish(),
    options: zConnectionOptions,
    rawSchema: zConnectionRawSchema.nullish(),
    serverTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectConnection' });

export type ProjectConnection = z.infer<typeof zProjectConnection>;
