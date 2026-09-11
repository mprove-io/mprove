import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskOrgAlreadyExistError,
  zDiskOrgAlreadyExistError
} from '#common/zod/disk/errors/disk-org-already-exist-error';

export type ToDiskCreateOrgError = DiskOrgAlreadyExistError;

export let zToDiskCreateOrgError = z.discriminatedUnion('code', [
  zDiskOrgAlreadyExistError
]);

assertTypesEqual<ToDiskCreateOrgError, z.infer<typeof zToDiskCreateOrgError>>({
  value: true
});
