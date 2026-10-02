import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskIsProjectExistError,
  zToDiskIsProjectExistError
} from './is-project-exist-error';
import {
  type ToDiskIsProjectExistOutput,
  zToDiskIsProjectExistOutput
} from './is-project-exist-output';

export type ToDiskIsProjectExistResponse = ToDiskResponseBase<
  'isProjectExist',
  ToDiskIsProjectExistOutput,
  ToDiskIsProjectExistError
>;

export let zToDiskIsProjectExistResponse = makeToDiskResponseSchema({
  operation: 'isProjectExist',
  output: zToDiskIsProjectExistOutput,
  error: zToDiskIsProjectExistError
});

assertTypesEqual<
  ToDiskIsProjectExistResponse,
  z.infer<typeof zToDiskIsProjectExistResponse>
>({ value: true });
