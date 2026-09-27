import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteProjectError,
  zToDiskDeleteProjectError
} from './delete-project-error';

export type ToDiskDeleteProjectResponse = ToDiskResponseBase<
  'deleteProject',
  ToDiskDeleteProjectOutput,
  ToDiskDeleteProjectError
>;

export type ToDiskDeleteProjectOutput = {
  orgId: string;
  deletedProjectId: string;
};

export let zToDiskDeleteProjectOutput = z
  .object({
    orgId: z.string(),
    deletedProjectId: z.string()
  })
  .meta({ id: 'ToDiskDeleteProjectOutput' });

export let zToDiskDeleteProjectResponse = makeToDiskResponseSchema({
  operation: 'deleteProject',
  output: zToDiskDeleteProjectOutput,
  error: zToDiskDeleteProjectError
});

assertTypesEqual<
  ToDiskDeleteProjectOutput,
  z.infer<typeof zToDiskDeleteProjectOutput>
>({ value: true });

assertTypesEqual<
  ToDiskDeleteProjectResponse,
  z.infer<typeof zToDiskDeleteProjectResponse>
>({ value: true });
