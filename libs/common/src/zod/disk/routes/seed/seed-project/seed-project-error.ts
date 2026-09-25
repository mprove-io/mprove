import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DiskPrepareRemoteAndProdError,
  zDiskPrepareRemoteAndProdError
} from '#common/zod/disk/function-errors/disk-prepare-remote-and-prod-error';

export type ToDiskSeedProjectError = DiskPrepareRemoteAndProdError;

export let zToDiskSeedProjectError = zDiskPrepareRemoteAndProdError;

assertTypesEqual<
  ToDiskSeedProjectError,
  z.infer<typeof zToDiskSeedProjectError>
>({ value: true });
