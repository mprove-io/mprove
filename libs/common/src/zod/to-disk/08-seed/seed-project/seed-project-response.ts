import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskSeedProjectResponseInfo,
  zToDiskSeedProjectResponseInfo
} from './seed-project-response-info';
import {
  type ToDiskSeedProjectResponsePayload,
  zToDiskSeedProjectResponsePayload
} from './seed-project-response-payload';

export type ToDiskSeedProjectResponse = Extend<
  MyResponse,
  {
    info: ToDiskSeedProjectResponseInfo;
    payload: ToDiskSeedProjectResponsePayload;
  }
>;

export let zToDiskSeedProjectResponse = zMyResponse
  .extend({
    info: zToDiskSeedProjectResponseInfo,
    payload: zToDiskSeedProjectResponsePayload
  })
  .meta({ id: 'ToDiskSeedProjectResponse' });

assertTypesEqual<
  ToDiskSeedProjectResponse,
  z.infer<typeof zToDiskSeedProjectResponse>
>({ value: true });
