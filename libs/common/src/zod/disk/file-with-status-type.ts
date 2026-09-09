import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type GitFileStatusEtype,
  zGitFileStatusEtype
} from '#common/zod/disk/git-file-status.etype';

export type FileWithStatusType = {
  path: string;
  type: GitFileStatusEtype;
};

export let zFileWithStatusType = z
  .object({
    path: z.string(),
    type: zGitFileStatusEtype
  })
  .meta({ id: 'FileWithStatusType' });

assertTypesEqual<FileWithStatusType, z.infer<typeof zFileWithStatusType>>({
  value: true
});
