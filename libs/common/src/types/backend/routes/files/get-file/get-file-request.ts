import { z } from 'zod';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetFileRequest = {
  operation: 'getFile';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    fileNodeId: string;
    builderLeft:
      | BuilderLeftEnum.Tree
      | BuilderLeftEnum.ChangesToCommit
      | BuilderLeftEnum.ChangesToPush
      | BuilderLeftEnum.Info;
  };
};

export let zToBackendGetFileRequest = z
  .strictObject({
    operation: z.literal('getFile'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        fileNodeId: z.string(),
        builderLeft: z.enum(BuilderLeftEnum)
      })
      .meta({ id: 'ToBackendGetFileInput' })
  })
  .meta({ id: 'ToBackendGetFileRequest' });

assertTypesEqual<
  ToBackendGetFileRequest,
  z.infer<typeof zToBackendGetFileRequest>
>({ value: true });
