import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskOrgAlreadyExistError,
  zDiskOrgAlreadyExistError
} from '#common/types/disk/errors/disk-org-already-exist-error';

export type DiskCheckOrgDoesNotExistError = DiskOrgAlreadyExistError;

export let zDiskCheckOrgDoesNotExistError = zDiskOrgAlreadyExistError;

assertTypesEqual<
  DiskCheckOrgDoesNotExistError,
  z.infer<typeof zDiskCheckOrgDoesNotExistError>
>({ value: true });
