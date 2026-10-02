import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskDeleteProjectError,
  zToDiskDeleteProjectError
} from './delete-project-error';
import {
  type ToDiskDeleteProjectOutput,
  zToDiskDeleteProjectOutput
} from './delete-project-output';

export type ToDiskDeleteProjectResponse = ToDiskResponseBase<
  'deleteProject',
  ToDiskDeleteProjectOutput,
  ToDiskDeleteProjectError
>;

export let zToDiskDeleteProjectResponse = makeToDiskResponseSchema({
  operation: 'deleteProject',
  output: zToDiskDeleteProjectOutput,
  error: zToDiskDeleteProjectError
});

assertTypesEqual<
  ToDiskDeleteProjectResponse,
  z.infer<typeof zToDiskDeleteProjectResponse>
>({ value: true });
