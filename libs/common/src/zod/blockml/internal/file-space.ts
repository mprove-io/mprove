import { z } from 'zod';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';

type FileSpaceFolder = {
  space?: string | null;
  space_line_num?: number | null;
  title?: string | null;
  title_line_num?: number | null;
  access_roles?: string[] | null;
  access_roles_line_num?: number | null;
  folders?: FileSpaceFolder[] | null;
  folders_line_num?: number | null;
  accessRolesCombined?: string[] | null;
};

let zFileSpaceFolder: z.ZodType<FileSpaceFolder> = z.lazy(() =>
  z.object({
    space: z.string().nullish(),
    space_line_num: z.number().nullish(),
    title: z.string().nullish(),
    title_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
    folders: z.array(zFileSpaceFolder).nullish(),
    folders_line_num: z.number().nullish(),
    accessRolesCombined: z.array(z.string()).nullish()
  })
);

export let zFileSpace = zFileBasic
  .extend({
    space: z.string().nullish(),
    space_line_num: z.number().nullish(),
    title: z.string().nullish(),
    title_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
    folders: z.array(zFileSpaceFolder).nullish(),
    folders_line_num: z.number().nullish(),
    accessRolesCombined: z.array(z.string()).nullish()
  })
  .meta({ id: 'FileSpace' });

export type FileSpace = z.infer<typeof zFileSpace>;
