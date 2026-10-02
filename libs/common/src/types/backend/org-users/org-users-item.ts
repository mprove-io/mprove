import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type OrgUsersItem = {
  userId: string;
  avatarSmall: string;
  email: string;
  alias: string;
  firstName: string;
  lastName: string;
  fullName: string;
  adminProjects: string[];
  editorProjects: string[];
  explorerProjects: string[];
  projectUserProjects: string[];
};

export let zOrgUsersItem = z
  .object({
    userId: z.string(),
    avatarSmall: z.string(),
    email: z.string(),
    alias: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    fullName: z.string(),
    adminProjects: z.array(z.string()),
    editorProjects: z.array(z.string()),
    explorerProjects: z.array(z.string()),
    projectUserProjects: z.array(z.string())
  })
  .meta({ id: 'OrgUsersItem' });

assertTypesEqual<OrgUsersItem, z.infer<typeof zOrgUsersItem>>({ value: true });
