import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskCreateOrgError,
  zToDiskCreateOrgError
} from './create-org-error';

export type ToDiskCreateOrgOutput = {
  orgId: string;
};

export type ToDiskCreateOrgResponse = ToDiskResponse<
  'createOrg',
  ToDiskCreateOrgOutput,
  ToDiskCreateOrgError
>;

export let zToDiskCreateOrgResponse = makeToDiskResponseSchema({
  operation: 'createOrg',
  success: z
    .object({
      orgId: z.string()
    })
    .meta({ id: 'ToDiskCreateOrgOutput' }),
  error: zToDiskCreateOrgError
});

assertTypesEqual<
  ToDiskCreateOrgResponse,
  z.infer<typeof zToDiskCreateOrgResponse>
>({ value: true });
