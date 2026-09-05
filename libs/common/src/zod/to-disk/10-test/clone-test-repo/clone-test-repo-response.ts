import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type MyResponse, zMyResponse } from '#common/zod/to/my-response';
import {
  type ToDiskCloneTestRepoResponseInfo,
  zToDiskCloneTestRepoResponseInfo
} from './clone-test-repo-response-info';
import {
  type ToDiskCloneTestRepoResponsePayload,
  zToDiskCloneTestRepoResponsePayload
} from './clone-test-repo-response-payload';

export type ToDiskCloneTestRepoResponse = Extend<
  MyResponse,
  {
    info: ToDiskCloneTestRepoResponseInfo;
    payload: ToDiskCloneTestRepoResponsePayload;
  }
>;

export let zToDiskCloneTestRepoResponse = zMyResponse
  .extend({
    info: zToDiskCloneTestRepoResponseInfo,
    payload: zToDiskCloneTestRepoResponsePayload
  })
  .meta({ id: 'ToDiskCloneTestRepoResponse' });

assertTypesEqual<
  ToDiskCloneTestRepoResponse,
  z.infer<typeof zToDiskCloneTestRepoResponse>
>({ value: true });
