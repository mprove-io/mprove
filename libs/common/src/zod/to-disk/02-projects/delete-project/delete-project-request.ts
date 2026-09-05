import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskDeleteProjectRequestInfo,
  zToDiskDeleteProjectRequestInfo
} from './delete-project-request-info';
import {
  type ToDiskDeleteProjectRequestPayload,
  zToDiskDeleteProjectRequestPayload
} from './delete-project-request-payload';

export type ToDiskDeleteProjectRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskDeleteProjectRequestInfo;
    payload: ToDiskDeleteProjectRequestPayload;
  }
>;

export let zToDiskDeleteProjectRequest = zToDiskRequest
  .extend({
    info: zToDiskDeleteProjectRequestInfo,
    payload: zToDiskDeleteProjectRequestPayload
  })
  .meta({ id: 'ToDiskDeleteProjectRequest' });

assertTypesEqual<
  ToDiskDeleteProjectRequest,
  z.infer<typeof zToDiskDeleteProjectRequest>
>({ value: true });
