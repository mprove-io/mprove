import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskCreateOrgError,
  zToDiskCreateOrgError
} from './create-org-error';

export type ToDiskCreateOrgResponse = ToDiskResponseBase<
  'createOrg',
  ToDiskCreateOrgOutput,
  ToDiskCreateOrgError
>;

export type ToDiskCreateOrgOutput = {
  orgId: string;
};

export let zToDiskCreateOrgOutput = z
  .object({
    orgId: z.string()
  })
  .meta({ id: 'ToDiskCreateOrgOutput' });

export let zToDiskCreateOrgResponse = makeToDiskResponseSchema({
  operation: 'createOrg',
  output: zToDiskCreateOrgOutput,
  error: zToDiskCreateOrgError
});

assertTypesEqual<ToDiskCreateOrgOutput, z.infer<typeof zToDiskCreateOrgOutput>>(
  { value: true }
);

assertTypesEqual<
  ToDiskCreateOrgResponse,
  z.infer<typeof zToDiskCreateOrgResponse>
>({ value: true });
