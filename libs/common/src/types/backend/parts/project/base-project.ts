import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectRemoteType,
  zProjectRemoteType
} from '#common/types/backend/parts/project/project-remote-type';

export type BaseProject = {
  orgId: string;
  projectId: string;
  remoteType: ProjectRemoteType;
  st: string;
  lt: string;
};

export let zBaseProject = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    remoteType: zProjectRemoteType,
    st: z.string(),
    lt: z.string()
  })
  .meta({ id: 'BaseProject' });

assertTypesEqual<BaseProject, z.infer<typeof zBaseProject>>({ value: true });
