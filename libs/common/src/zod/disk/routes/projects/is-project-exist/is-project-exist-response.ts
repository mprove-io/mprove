import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/zod/disk/response/to-disk-response-base';
import {
  type ToDiskIsProjectExistError,
  zToDiskIsProjectExistError
} from './is-project-exist-error';

export type ToDiskIsProjectExistResponse = ToDiskResponseBase<
  'isProjectExist',
  ToDiskIsProjectExistOutput,
  ToDiskIsProjectExistError
>;

export type ToDiskIsProjectExistOutput = {
  orgId: string;
  projectId: string;
  isProjectExist: boolean;
};

export let zToDiskIsProjectExistOutput = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    isProjectExist: z.boolean()
  })
  .meta({ id: 'ToDiskIsProjectExistOutput' });

export let zToDiskIsProjectExistResponse = makeToDiskResponseSchema({
  operation: 'isProjectExist',
  output: zToDiskIsProjectExistOutput,
  error: zToDiskIsProjectExistError
});

assertTypesEqual<
  ToDiskIsProjectExistOutput,
  z.infer<typeof zToDiskIsProjectExistOutput>
>({ value: true });

assertTypesEqual<
  ToDiskIsProjectExistResponse,
  z.infer<typeof zToDiskIsProjectExistResponse>
>({ value: true });
