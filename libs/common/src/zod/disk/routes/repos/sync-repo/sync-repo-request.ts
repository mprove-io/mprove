import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';
import {
  type DiskSyncFile,
  zDiskSyncFile
} from '#common/zod/disk/disk-sync-file';

export type ToDiskSyncRepoRequest =
  | {
      operation: 'syncRepo';
      traceId: string;
      input: {
        direction: 'from-server';
        baseProject: BaseProject;
        repoId: string;
        branch: string;
        lastCommit: string;
        getRepo?: boolean;
        getRepoNodes?: boolean;
      };
    }
  | {
      operation: 'syncRepo';
      traceId: string;
      input: {
        direction: 'to-server';
        baseProject: BaseProject;
        repoId: string;
        branch: string;
        lastCommit: string;
        getRepo?: boolean;
        getRepoNodes?: boolean;
        changedFiles: DiskSyncFile[];
        deletedFiles: DiskSyncFile[];
      };
    };

export let zToDiskSyncRepoRequest = z
  .union([
    z.strictObject({
      operation: z.literal('syncRepo'),
      traceId: z.string(),
      input: z
        .object({
          direction: z.literal('from-server'),
          baseProject: zBaseProject,
          repoId: z.string(),
          branch: z.string(),
          lastCommit: z.string(),
          getRepo: z.boolean().nullish(),
          getRepoNodes: z.boolean().nullish()
        })
        .meta({ id: 'ToDiskSyncRepoFromServerRequestInput' })
    }),
    z.strictObject({
      operation: z.literal('syncRepo'),
      traceId: z.string(),
      input: z
        .object({
          direction: z.literal('to-server'),
          baseProject: zBaseProject,
          repoId: z.string(),
          branch: z.string(),
          lastCommit: z.string(),
          getRepo: z.boolean().nullish(),
          getRepoNodes: z.boolean().nullish(),
          changedFiles: z.array(zDiskSyncFile),
          deletedFiles: z.array(zDiskSyncFile)
        })
        .meta({ id: 'ToDiskSyncRepoToServerRequestInput' })
    })
  ])
  .meta({ id: 'ToDiskSyncRepoRequest' });

assertTypesEqual<ToDiskSyncRepoRequest, z.infer<typeof zToDiskSyncRepoRequest>>(
  {
    value: true
  }
);
