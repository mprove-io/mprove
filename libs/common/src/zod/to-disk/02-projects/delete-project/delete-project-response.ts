import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskDeleteProjectResponseInfo,
  zToDiskDeleteProjectResponseInfo
} from './delete-project-response-info';
import {
  type ToDiskDeleteProjectResponsePayload,
  zToDiskDeleteProjectResponsePayload
} from './delete-project-response-payload';

export type ToDiskDeleteProjectResponse = Extend<
  MyResponse,
  {
    info: ToDiskDeleteProjectResponseInfo;
    payload: ToDiskDeleteProjectResponsePayload;
  }
>;

export let zToDiskDeleteProjectResponse = zMyResponse
  .extend({
    info: zToDiskDeleteProjectResponseInfo,
    payload: zToDiskDeleteProjectResponsePayload
  })
  .meta({ id: 'ToDiskDeleteProjectResponse' });

assertTypesEqual<
  ToDiskDeleteProjectResponse,
  z.infer<typeof zToDiskDeleteProjectResponse>
>({ value: true });
