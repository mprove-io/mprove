import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DatabricksAuthType,
  zDatabricksAuthType
} from '#common/types/backend/parts/connection-parts/databricks-auth-type';

export type OptionsDatabricks = {
  authType?: DatabricksAuthType;
  host?: string;
  internalHost?: string;
  path?: string;
  token?: string;
  oauthClientId?: string;
  oauthClientSecret?: string;
  defaultCatalog?: string;
  defaultSchema?: string;
};

export let zOptionsDatabricks = z
  .object({
    authType: zDatabricksAuthType.nullish(),
    host: z.string().nullish(),
    internalHost: z.string().nullish(),
    path: z.string().nullish(),
    token: z.string().nullish(),
    oauthClientId: z.string().nullish(),
    oauthClientSecret: z.string().nullish(),
    defaultCatalog: z.string().nullish(),
    defaultSchema: z.string().nullish()
  })
  .meta({ id: 'OptionsDatabricks' });

assertTypesEqual<OptionsDatabricks, z.infer<typeof zOptionsDatabricks>>({
  value: true
});
