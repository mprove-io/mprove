import type { ModelDef as MalloyModelDef } from '@malloydata/malloy';
import { z } from 'zod';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ModelTypeEnum } from '#common/enums/model-type.enum';
import type { FileStore } from '#common/zod/blockml/internal/file-store';
import { zModelField } from '#common/zod/blockml/model-field';
import { zModelNode } from '#common/zod/blockml/model-node';

// TODO: aligned to interface `Model` for blockml type-flow.
// `source` is non-nullish because blockml's wrapModels always sets it;
// `hasAccess` is nullish because blockml builds Models without it — the
// backend later populates it via checkModelAccess before forwarding to tiles.
export let zModel = z
  .object({
    structId: z.string(),
    modelId: z.string(),
    type: z.enum(ModelTypeEnum),
    source: z.string(),
    connectionId: z.string(),
    connectionType: z.enum(ConnectionTypeEnum),
    filePath: z.string(),
    fileText: z.string(),
    storeContent: z.custom<FileStore>(),
    dateRangeIncludesRightSide: z.boolean(),
    accessRoles: z.array(z.string()),
    label: z.string(),
    fields: z.array(zModelField),
    nodes: z.array(zModelNode),
    malloyModelDef: z.custom<MalloyModelDef>(),
    serverTs: z.number().int(),
    hasAccess: z.boolean().nullish()
  })
  .meta({ id: 'Model' });

export type Model = z.infer<typeof zModel>;
