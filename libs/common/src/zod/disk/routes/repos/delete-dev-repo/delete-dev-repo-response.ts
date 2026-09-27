import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteDevRepoError,
  zToDiskDeleteDevRepoError
} from './delete-dev-repo-error';

export type ToDiskDeleteDevRepoResponse = ToDiskResponseBase<
  'deleteDevRepo',
  ToDiskDeleteDevRepoOutput,
  ToDiskDeleteDevRepoError
>;

export type ToDiskDeleteDevRepoOutput = {
  orgId: string;
  projectId: string;
  deletedRepoId: string;
};

export let zToDiskDeleteDevRepoOutput = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    deletedRepoId: z.string()
  })
  .meta({ id: 'ToDiskDeleteDevRepoOutput' });

export let zToDiskDeleteDevRepoResponse = makeToDiskResponseSchema({
  operation: 'deleteDevRepo',
  output: zToDiskDeleteDevRepoOutput,
  error: zToDiskDeleteDevRepoError
});

assertTypesEqual<
  ToDiskDeleteDevRepoOutput,
  z.infer<typeof zToDiskDeleteDevRepoOutput>
>({ value: true });

assertTypesEqual<
  ToDiskDeleteDevRepoResponse,
  z.infer<typeof zToDiskDeleteDevRepoResponse>
>({ value: true });
