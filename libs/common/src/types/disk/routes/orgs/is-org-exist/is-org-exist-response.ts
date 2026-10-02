import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskIsOrgExistError,
  zToDiskIsOrgExistError
} from './is-org-exist-error';
import {
  type ToDiskIsOrgExistOutput,
  zToDiskIsOrgExistOutput
} from './is-org-exist-output';

export type ToDiskIsOrgExistResponse = ToDiskResponseBase<
  'isOrgExist',
  ToDiskIsOrgExistOutput,
  ToDiskIsOrgExistError
>;

export let zToDiskIsOrgExistResponse = makeToDiskResponseSchema({
  operation: 'isOrgExist',
  output: zToDiskIsOrgExistOutput,
  error: zToDiskIsOrgExistError
});

assertTypesEqual<
  ToDiskIsOrgExistResponse,
  z.infer<typeof zToDiskIsOrgExistResponse>
>({ value: true });
