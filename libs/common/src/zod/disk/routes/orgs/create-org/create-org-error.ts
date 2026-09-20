import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskCheckOrgDoesNotExistError,
  zDiskCheckOrgDoesNotExistError
} from '#common/zod/disk/function-errors/disk-check-org-does-not-exist-error';

export type ToDiskCreateOrgError = DiskCheckOrgDoesNotExistError;

export let zToDiskCreateOrgError = zDiskCheckOrgDoesNotExistError;

assertTypesEqual<ToDiskCreateOrgError, z.infer<typeof zToDiskCreateOrgError>>({
  value: true
});
