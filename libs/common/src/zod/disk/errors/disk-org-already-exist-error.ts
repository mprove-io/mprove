import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';

export type DiskOrgAlreadyExistError = {
  code: 'DISK_ORG_ALREADY_EXIST';
};

export let zDiskOrgAlreadyExistError = z.object({
  code: z.literal('DISK_ORG_ALREADY_EXIST')
});

assertTypesEqual<
  DiskOrgAlreadyExistError,
  z.infer<typeof zDiskOrgAlreadyExistError>
>({ value: true });
