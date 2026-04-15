import { z } from 'zod';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { zBaseProject } from '#common/zod/backend/base-project';
import { zRepo } from '#common/zod/disk/repo';
import { zMyResponse } from '#common/zod/to/my-response';
import { zToDiskRequest } from '#common/zod/to-disk/to-disk-request';

export let zToDiskGetFileRequestPayload = z
  .object({
    orgId: z.string(),
    baseProject: zBaseProject,
    repoId: z.string(),
    branch: z.string(),
    fileNodeId: z.string(),
    builderLeft: z.enum(BuilderLeftEnum)
  })
  .meta({ id: 'ToDiskGetFileRequestPayload' });

export let zToDiskGetFileRequest = zToDiskRequest
  .extend({
    payload: zToDiskGetFileRequestPayload
  })
  .meta({ id: 'ToDiskGetFileRequest' });

export let zToDiskGetFileResponsePayload = z
  .object({
    repo: zRepo,
    originalContent: z.string(),
    content: z.string(),
    isExist: z.boolean()
  })
  .meta({ id: 'ToDiskGetFileResponsePayload' });

export let zToDiskGetFileResponse = zMyResponse
  .extend({
    payload: zToDiskGetFileResponsePayload
  })
  .meta({ id: 'ToDiskGetFileResponse' });

export type ToDiskGetFileRequestPayload = z.infer<
  typeof zToDiskGetFileRequestPayload
>;
export type ToDiskGetFileRequest = z.infer<typeof zToDiskGetFileRequest>;
export type ToDiskGetFileResponsePayload = z.infer<
  typeof zToDiskGetFileResponsePayload
>;
export type ToDiskGetFileResponse = z.infer<typeof zToDiskGetFileResponse>;
