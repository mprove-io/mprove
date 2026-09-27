import { z } from 'zod';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetFileInput = {
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

export type ToBackendGetFileRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetFileInput;
};

export let zToBackendGetFileInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fileNodeId: z.string(),
    builderLeft: z.enum(BuilderLeftEnum)
  })
  .meta({ id: 'ToBackendGetFileInput' });

export let zToBackendGetFileRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetFileInput
  })
  .meta({ id: 'ToBackendGetFileRequest' });

assertTypesEqual<ToBackendGetFileInput, z.infer<typeof zToBackendGetFileInput>>(
  { value: true }
);

assertTypesEqual<
  ToBackendGetFileRequest,
  z.infer<typeof zToBackendGetFileRequest>
>({ value: true });
