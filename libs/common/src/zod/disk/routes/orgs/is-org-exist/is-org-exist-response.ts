import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskIsOrgExistError,
  zToDiskIsOrgExistError
} from './is-org-exist-error';

export type ToDiskIsOrgExistResponse = ToDiskResponseBase<
  'isOrgExist',
  ToDiskIsOrgExistOutput,
  ToDiskIsOrgExistError
>;

export type ToDiskIsOrgExistOutput = {
  orgId: string;
  isOrgExist: boolean;
};

export let zToDiskIsOrgExistOutput = z
  .object({ orgId: z.string(), isOrgExist: z.boolean() })
  .meta({ id: 'ToDiskIsOrgExistOutput' });

export let zToDiskIsOrgExistResponse = makeToDiskResponseSchema({
  operation: 'isOrgExist',
  output: zToDiskIsOrgExistOutput,
  error: zToDiskIsOrgExistError
});

assertTypesEqual<
  ToDiskIsOrgExistOutput,
  z.infer<typeof zToDiskIsOrgExistOutput>
>({ value: true });

assertTypesEqual<
  ToDiskIsOrgExistResponse,
  z.infer<typeof zToDiskIsOrgExistResponse>
>({ value: true });
