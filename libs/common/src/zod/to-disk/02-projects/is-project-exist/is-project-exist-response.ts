import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskIsProjectExistError,
  zToDiskIsProjectExistError
} from './is-project-exist-error';

export type ToDiskIsProjectExistOutput = {
  orgId: string;
  projectId: string;
  isProjectExist: boolean;
};

export type ToDiskIsProjectExistResponse = ToDiskResponse<
  'ToDiskIsProjectExist',
  ToDiskIsProjectExistOutput,
  ToDiskIsProjectExistError
>;

export let zToDiskIsProjectExistResponse = makeToDiskResponseSchema({
  path: 'ToDiskIsProjectExist',
  success: z
    .object({
      orgId: z.string(),
      projectId: z.string(),
      isProjectExist: z.boolean()
    })
    .meta({ id: 'ToDiskIsProjectExistOutput' }),
  error: zToDiskIsProjectExistError
});

assertTypesEqual<
  ToDiskIsProjectExistResponse,
  z.infer<typeof zToDiskIsProjectExistResponse>
>({ value: true });
