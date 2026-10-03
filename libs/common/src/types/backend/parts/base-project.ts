import { z } from 'zod';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type BaseProject = {
  orgId: string;
  projectId: string;
  remoteType: EnumValues<typeof ProjectRemoteTypeEnum>;
  st: string;
  lt: string;
};

export let zBaseProject = z
  .object({
    orgId: z.string(),
    projectId: z.string(),
    remoteType: z.enum(ProjectRemoteTypeEnum),
    st: z.string(),
    lt: z.string()
  })
  .meta({ id: 'BaseProject' });

assertTypesEqual<BaseProject, z.infer<typeof zBaseProject>>({ value: true });
