import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToDiskResponseSchema,
  type ToDiskResponseBase
} from '#common/types/disk/response/to-disk-response-base';
import {
  type ToDiskSeedProjectError,
  zToDiskSeedProjectError
} from './seed-project-error';
import {
  type ToDiskSeedProjectOutput,
  zToDiskSeedProjectOutput
} from './seed-project-output';

export type ToDiskSeedProjectResponse = ToDiskResponseBase<
  'seedProject',
  ToDiskSeedProjectOutput,
  ToDiskSeedProjectError
>;

export let zToDiskSeedProjectResponse = makeToDiskResponseSchema({
  operation: 'seedProject',
  output: zToDiskSeedProjectOutput,
  error: zToDiskSeedProjectError
});

assertTypesEqual<
  ToDiskSeedProjectResponse,
  z.infer<typeof zToDiskSeedProjectResponse>
>({ value: true });
