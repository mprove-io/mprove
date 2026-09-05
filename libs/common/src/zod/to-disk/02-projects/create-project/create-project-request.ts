import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskCreateProjectRequestInfo,
  zToDiskCreateProjectRequestInfo
} from './create-project-request-info';
import {
  type ToDiskCreateProjectRequestPayload,
  zToDiskCreateProjectRequestPayload
} from './create-project-request-payload';

export type ToDiskCreateProjectRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskCreateProjectRequestInfo;
    payload: ToDiskCreateProjectRequestPayload;
  }
>;

export let zToDiskCreateProjectRequest = zToDiskRequest
  .extend({
    info: zToDiskCreateProjectRequestInfo,
    payload: zToDiskCreateProjectRequestPayload
  })
  .meta({ id: 'ToDiskCreateProjectRequest' });

assertTypesEqual<
  ToDiskCreateProjectRequest,
  z.infer<typeof zToDiskCreateProjectRequest>
>({ value: true });
