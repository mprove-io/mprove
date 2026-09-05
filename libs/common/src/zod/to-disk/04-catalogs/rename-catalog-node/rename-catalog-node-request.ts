import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskRenameCatalogNodeRequestInfo,
  zToDiskRenameCatalogNodeRequestInfo
} from './rename-catalog-node-request-info';
import {
  type ToDiskRenameCatalogNodeRequestPayload,
  zToDiskRenameCatalogNodeRequestPayload
} from './rename-catalog-node-request-payload';

export type ToDiskRenameCatalogNodeRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskRenameCatalogNodeRequestInfo;
    payload: ToDiskRenameCatalogNodeRequestPayload;
  }
>;

export let zToDiskRenameCatalogNodeRequest = zToDiskRequest
  .extend({
    info: zToDiskRenameCatalogNodeRequestInfo,
    payload: zToDiskRenameCatalogNodeRequestPayload
  })
  .meta({ id: 'ToDiskRenameCatalogNodeRequest' });

assertTypesEqual<
  ToDiskRenameCatalogNodeRequest,
  z.infer<typeof zToDiskRenameCatalogNodeRequest>
>({ value: true });
