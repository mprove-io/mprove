import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskCreateProjectError,
  zToDiskCreateProjectError
} from './create-project-error';
import {
  type ToDiskCreateProjectOutput,
  zToDiskCreateProjectOutput
} from './create-project-output';

export type ToDiskCreateProjectResponse = ToDiskResponseBase<
  'createProject',
  ToDiskCreateProjectOutput,
  ToDiskCreateProjectError
>;

export let zToDiskCreateProjectResponse = makeToDiskResponseSchema({
  operation: 'createProject',
  output: zToDiskCreateProjectOutput,
  error: zToDiskCreateProjectError
});

assertTypesEqual<
  ToDiskCreateProjectResponse,
  z.infer<typeof zToDiskCreateProjectResponse>
>({ value: true });
