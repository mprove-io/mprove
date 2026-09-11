import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import {
  type BaseProject,
  zBaseProject
} from '#common/zod/backend/base-project';

export type ToDiskSeedProjectRequest = {
  operation: 'seedProject';
  traceId: string;
  input: {
    baseProject: BaseProject;
    seedProjectId?: string;
    devRepoId: string;
    userAlias: string;
  };
};

export let zToDiskSeedProjectRequest = z
  .strictObject({
    operation: z.literal('seedProject'),
    traceId: z.string(),
    input: z
      .object({
        baseProject: zBaseProject,
        seedProjectId: z.string().nullish(),
        devRepoId: z.string(),
        userAlias: z.string()
      })
      .meta({ id: 'ToDiskSeedProjectRequestInput' })
  })
  .meta({ id: 'ToDiskSeedProjectRequest' });

assertTypesEqual<
  ToDiskSeedProjectRequest,
  z.infer<typeof zToDiskSeedProjectRequest>
>({ value: true });
