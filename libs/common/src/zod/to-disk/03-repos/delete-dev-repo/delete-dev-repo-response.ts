import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskDeleteDevRepoError,
  zToDiskDeleteDevRepoError
} from './delete-dev-repo-error';

export type ToDiskDeleteDevRepoOutput = {
  orgId: string;
  projectId: string;
  deletedRepoId: string;
};

export type ToDiskDeleteDevRepoResponse = ToDiskResponse<
  'ToDiskDeleteDevRepo',
  ToDiskDeleteDevRepoOutput,
  ToDiskDeleteDevRepoError
>;

export let zToDiskDeleteDevRepoResponse = makeToDiskResponseSchema({
  path: 'ToDiskDeleteDevRepo',
  success: z
    .object({
      orgId: z.string(),
      projectId: z.string(),
      deletedRepoId: z.string()
    })
    .meta({ id: 'ToDiskDeleteDevRepoOutput' }),
  error: zToDiskDeleteDevRepoError
});

assertTypesEqual<
  ToDiskDeleteDevRepoResponse,
  z.infer<typeof zToDiskDeleteDevRepoResponse>
>({ value: true });
