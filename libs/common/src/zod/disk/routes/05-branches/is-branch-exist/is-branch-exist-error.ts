import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsBranchExistError = never;

export let zToDiskIsBranchExistError = z.never();

assertTypesEqual<
  ToDiskIsBranchExistError,
  z.infer<typeof zToDiskIsBranchExistError>
>({ value: true });
