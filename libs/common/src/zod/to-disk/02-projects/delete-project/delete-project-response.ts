import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponse
} from '#common/zod/to-disk/to-disk-response';
import {
  type ToDiskDeleteProjectError,
  zToDiskDeleteProjectError
} from './delete-project-error';

export type ToDiskDeleteProjectOutput = {
  orgId: string;
  deletedProjectId: string;
};

export type ToDiskDeleteProjectResponse = ToDiskResponse<
  'deleteProject',
  ToDiskDeleteProjectOutput,
  ToDiskDeleteProjectError
>;

export let zToDiskDeleteProjectResponse = makeToDiskResponseSchema({
  operation: 'deleteProject',
  success: z
    .object({
      orgId: z.string(),
      deletedProjectId: z.string()
    })
    .meta({ id: 'ToDiskDeleteProjectOutput' }),
  error: zToDiskDeleteProjectError
});

assertTypesEqual<
  ToDiskDeleteProjectResponse,
  z.infer<typeof zToDiskDeleteProjectResponse>
>({ value: true });
