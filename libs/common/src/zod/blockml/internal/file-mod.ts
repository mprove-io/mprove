import type { Model as MalloyModel } from '@malloydata/malloy';
import type { ModelEntryValueWithSource } from '@malloydata/malloy-interfaces';
import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';

export let zFileMod = zFileBasic
  .extend({
    source: z.string().nullish(),
    label: z.string().nullish(),
    location: z.string().nullish(),
    blockmlPath: z.string().nullish(),
    access_roles: z.array(z.string()).nullish(),
    connectionId: z.string().nullish(),
    connectionType: z.enum(ConnectionTypeEnum).nullish(),
    malloyModel: z.custom<MalloyModel>().nullish(),
    valueWithSourceInfo: z.custom<ModelEntryValueWithSource>().nullish()
  })
  .meta({ id: 'FileMod' });

export type FileMod = z.infer<typeof zFileMod>;
