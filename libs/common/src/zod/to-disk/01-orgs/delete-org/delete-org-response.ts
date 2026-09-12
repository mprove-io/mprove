import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskDeleteOrgError,
  zToDiskDeleteOrgError
} from './delete-org-error';

export type ToDiskDeleteOrgOutput = {
  deletedOrgId: string;
};

export type ToDiskDeleteOrgResponse = ToDiskResponse<
  'deleteOrg',
  ToDiskDeleteOrgOutput,
  ToDiskDeleteOrgError
>;

export let zToDiskDeleteOrgResponse = makeToDiskResponseSchema({
  operation: 'deleteOrg',
  success: z
    .object({
      deletedOrgId: z.string()
    })
    .meta({ id: 'ToDiskDeleteOrgOutput' }),
  error: zToDiskDeleteOrgError
});

assertTypesEqual<
  ToDiskDeleteOrgResponse,
  z.infer<typeof zToDiskDeleteOrgResponse>
>({ value: true });
