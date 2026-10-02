import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskCreateOrgError,
  zToDiskCreateOrgError
} from './create-org-error';
import {
  type ToDiskCreateOrgOutput,
  zToDiskCreateOrgOutput
} from './create-org-output';

export type ToDiskCreateOrgResponse = ToDiskResponseBase<
  'createOrg',
  ToDiskCreateOrgOutput,
  ToDiskCreateOrgError
>;

export let zToDiskCreateOrgResponse = makeToDiskResponseSchema({
  operation: 'createOrg',
  output: zToDiskCreateOrgOutput,
  error: zToDiskCreateOrgError
});

assertTypesEqual<
  ToDiskCreateOrgResponse,
  z.infer<typeof zToDiskCreateOrgResponse>
>({ value: true });
