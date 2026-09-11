import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsProjectExistError = never;

export let zToDiskIsProjectExistError = z.never();

assertTypesEqual<
  ToDiskIsProjectExistError,
  z.infer<typeof zToDiskIsProjectExistError>
>({ value: true });
