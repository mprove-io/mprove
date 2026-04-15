import { z } from 'zod';

export let zGitFileStatusType = z
  .enum([
    'not_added',
    'created',
    'deleted',
    'modified',
    'renamed',
    'conflicted'
  ])
  .meta({ id: 'GitFileStatusType' });

export type GitFileStatusType = z.infer<typeof zGitFileStatusType>;

export let zFileWithStatusType = z
  .object({
    path: z.string(),
    type: zGitFileStatusType
  })
  .meta({ id: 'FileWithStatusType' });

export type FileWithStatusType = z.infer<typeof zFileWithStatusType>;
