import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteOrgError,
  zToDiskDeleteOrgError
} from './delete-org-error';
import {
  type ToDiskDeleteOrgOutput,
  zToDiskDeleteOrgOutput
} from './delete-org-output';

export type ToDiskDeleteOrgResponse = ToDiskResponseBase<
  'deleteOrg',
  ToDiskDeleteOrgOutput,
  ToDiskDeleteOrgError
>;

export let zToDiskDeleteOrgResponse = makeToDiskResponseSchema({
  operation: 'deleteOrg',
  output: zToDiskDeleteOrgOutput,
  error: zToDiskDeleteOrgError
});

assertTypesEqual<
  ToDiskDeleteOrgResponse,
  z.infer<typeof zToDiskDeleteOrgResponse>
>({ value: true });
