import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteOrgError,
  zToDiskDeleteOrgError
} from './delete-org-error';

export type ToDiskDeleteOrgResponse = ToDiskResponseBase<
  'deleteOrg',
  ToDiskDeleteOrgOutput,
  ToDiskDeleteOrgError
>;

export type ToDiskDeleteOrgOutput = {
  deletedOrgId: string;
};

export let zToDiskDeleteOrgOutput = z
  .object({
    deletedOrgId: z.string()
  })
  .meta({ id: 'ToDiskDeleteOrgOutput' });

export let zToDiskDeleteOrgResponse = makeToDiskResponseSchema({
  operation: 'deleteOrg',
  output: zToDiskDeleteOrgOutput,
  error: zToDiskDeleteOrgError
});

assertTypesEqual<ToDiskDeleteOrgOutput, z.infer<typeof zToDiskDeleteOrgOutput>>(
  { value: true }
);

assertTypesEqual<
  ToDiskDeleteOrgResponse,
  z.infer<typeof zToDiskDeleteOrgResponse>
>({ value: true });
