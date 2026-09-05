import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskRequest,
  zToDiskRequest
} from '#common/zod/to-disk/to-disk-request';
import {
  type ToDiskSeedProjectRequestInfo,
  zToDiskSeedProjectRequestInfo
} from './seed-project-request-info';
import {
  type ToDiskSeedProjectRequestPayload,
  zToDiskSeedProjectRequestPayload
} from './seed-project-request-payload';

export type ToDiskSeedProjectRequest = Extend<
  ToDiskRequest,
  {
    info: ToDiskSeedProjectRequestInfo;
    payload: ToDiskSeedProjectRequestPayload;
  }
>;

export let zToDiskSeedProjectRequest = zToDiskRequest
  .extend({
    info: zToDiskSeedProjectRequestInfo,
    payload: zToDiskSeedProjectRequestPayload
  })
  .meta({ id: 'ToDiskSeedProjectRequest' });

assertTypesEqual<
  ToDiskSeedProjectRequest,
  z.infer<typeof zToDiskSeedProjectRequest>
>({ value: true });
