import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionOptions,
  zConnectionOptions
} from '#common/types/backend/parts/connection-parts/connection-options';
import {
  type ConnectionRawSchema,
  zConnectionRawSchema
} from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { EnumValues } from '#common/types/enum-values';

export type ProjectConnection = {
  projectId?: string;
  connectionId?: string;
  envId?: string;
  type?: EnumValues<typeof ConnectionTypeEnum>;
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
    type: z.enum(ConnectionTypeEnum).nullish(),
    options: zConnectionOptions,
    rawSchema: zConnectionRawSchema.nullish(),
    serverTs: z.number().int().nullish()
  })
  .meta({ id: 'ProjectConnection' });

assertTypesEqual<ProjectConnection, z.infer<typeof zProjectConnection>>({
  value: true
});
