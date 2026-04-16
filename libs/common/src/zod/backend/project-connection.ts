import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { zConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import { zConnectionRawSchema } from '#common/zod/backend/connection-schemas/raw-schema';

// TODO: `options` tightened (removed `.nullish()`) to match the
// `ProjectConnection` interface's required TS field so blockml's
// rebuild-struct service can pass projectConnections into node-common helpers
// (makeMalloyConnections, prePopulateMalloySchemaCache). Revisit once
// node-common migrates to zod types.
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
