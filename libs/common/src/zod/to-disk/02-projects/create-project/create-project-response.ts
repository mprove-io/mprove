import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskCreateProjectResponseInfo,
  zToDiskCreateProjectResponseInfo
} from './create-project-response-info';
import {
  type ToDiskCreateProjectResponsePayload,
  zToDiskCreateProjectResponsePayload
} from './create-project-response-payload';

export type ToDiskCreateProjectResponse = Extend<
  MyResponse,
  {
    info: ToDiskCreateProjectResponseInfo;
    payload: ToDiskCreateProjectResponsePayload;
  }
>;

export let zToDiskCreateProjectResponse = zMyResponse
  .extend({
    info: zToDiskCreateProjectResponseInfo,
    payload: zToDiskCreateProjectResponsePayload
  })
  .meta({ id: 'ToDiskCreateProjectResponse' });

assertTypesEqual<
  ToDiskCreateProjectResponse,
  z.infer<typeof zToDiskCreateProjectResponse>
>({ value: true });
