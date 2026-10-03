import { z } from 'zod';
import { DatabricksAuthTypeEnum } from '#common/enums/databricks-auth-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type OptionsDatabricks = {
  authType?: EnumValues<typeof DatabricksAuthTypeEnum>;
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
    authType: z.enum(DatabricksAuthTypeEnum).nullish(),
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
