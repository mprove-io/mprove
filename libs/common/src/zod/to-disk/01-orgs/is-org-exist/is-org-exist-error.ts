import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type ToDiskIsOrgExistError = never;

export let zToDiskIsOrgExistError = z.never();

assertTypesEqual<ToDiskIsOrgExistError, z.infer<typeof zToDiskIsOrgExistError>>(
  { value: true }
);
