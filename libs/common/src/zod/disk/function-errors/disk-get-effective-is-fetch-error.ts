import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type GetChangesToCommitError,
  zGetChangesToCommitError
} from '#common/zod/node-common/function-errors/get-changes-to-commit-error';

export type DiskGetEffectiveIsFetchError = GetChangesToCommitError;

export let zDiskGetEffectiveIsFetchError = zGetChangesToCommitError;

assertTypesEqual<
  DiskGetEffectiveIsFetchError,
  z.infer<typeof zDiskGetEffectiveIsFetchError>
>({ value: true });
