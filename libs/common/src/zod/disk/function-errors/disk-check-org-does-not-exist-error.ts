import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type DiskOrgAlreadyExistError,
  zDiskOrgAlreadyExistError
} from '#common/zod/disk/errors/disk-org-already-exist-error';

export type DiskCheckOrgDoesNotExistError = DiskOrgAlreadyExistError;

export let zDiskCheckOrgDoesNotExistError = zDiskOrgAlreadyExistError;

assertTypesEqual<
  DiskCheckOrgDoesNotExistError,
  z.infer<typeof zDiskCheckOrgDoesNotExistError>
>({ value: true });
