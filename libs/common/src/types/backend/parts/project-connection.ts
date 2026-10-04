import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';
import {
  type ConnectionType,
  zConnectionType
} from '#common/types/backend/parts/connection-parts/connection-type';
import {
  type ConnectionRawSchema,
  zConnectionRawSchema
} from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';

export type ProjectConnection = {
  projectId?: string;
  connectionId?: string;
  envId?: string;
  type?: ConnectionType;
  options: ConnectionOptions;
  rawSchema?: ConnectionRawSchema;
  serverTs?: number;
};

// TODO: `options` is tightened (non-nullish) despite interface `@IsOptional()`.
// Reason: makeMalloyConnections in libs/node-common dereferences
// x.options.<provider> directly without null guards. Loosen here only after
// that helper null-guards options.
export let zProjectConnection = z
  .object({
    projectId: z.string().nullish(),
    connectionId: z.string().nullish(),
    envId: z.string().nullish(),
    type: zConnectionType.nullish(),
    options: zConnectionOptions,
    rawSchema: zConnectionRawSchema.nullish(),
    serverTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectConnection' });

assertTypesEqual<ProjectConnection, z.infer<typeof zProjectConnection>>({
  value: true
});
