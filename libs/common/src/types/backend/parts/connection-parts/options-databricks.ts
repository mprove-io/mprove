import { z } from 'zod';
import { DatabricksAuthTypeEnum } from '#common/enums/databricks-auth-type.enum';

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

export type OptionsDatabricks = z.infer<typeof zOptionsDatabricks>;
