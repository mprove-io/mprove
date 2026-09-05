import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskMoveCatalogNodeRequestInfo,
  zToDiskMoveCatalogNodeRequestInfo
} from './move-catalog-node-request-info';
import {
  type ToDiskMoveCatalogNodeRequestPayload,
  zToDiskMoveCatalogNodeRequestPayload
} from './move-catalog-node-request-payload';

export type ToDiskMoveCatalogNodeRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskMoveCatalogNodeRequestInfo;
    payload: ToDiskMoveCatalogNodeRequestPayload;
  }
>;

export let zToDiskMoveCatalogNodeRequest = zToDiskRequest
  .extend({
    info: zToDiskMoveCatalogNodeRequestInfo,
    payload: zToDiskMoveCatalogNodeRequestPayload
  })
  .meta({ id: 'ToDiskMoveCatalogNodeRequest' });

assertTypesEqual<
  ToDiskMoveCatalogNodeRequest,
  z.infer<typeof zToDiskMoveCatalogNodeRequest>
>({ value: true });
