import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskIsOrgExistError,
  zToDiskIsOrgExistError
} from './is-org-exist-error';

export type ToDiskIsOrgExistOutput = {
  orgId: string;
  isOrgExist: boolean;
};

export type ToDiskIsOrgExistResponse = ToDiskResponse<
  'isOrgExist',
  ToDiskIsOrgExistOutput,
  ToDiskIsOrgExistError
>;

export let zToDiskIsOrgExistResponse = makeToDiskResponseSchema({
  operation: 'isOrgExist',
  success: z
    .object({ orgId: z.string(), isOrgExist: z.boolean() })
    .meta({ id: 'ToDiskIsOrgExistOutput' }),
  error: zToDiskIsOrgExistError
});

assertTypesEqual<
  ToDiskIsOrgExistResponse,
  z.infer<typeof zToDiskIsOrgExistResponse>
>({ value: true });
