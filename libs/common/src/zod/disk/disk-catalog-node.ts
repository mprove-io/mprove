import { z } from 'zod';

// Previous z.lazy()-based recursion — kept commented for reference.
// export type DiskCatalogNode = {
//   id: string;
//   isFolder: boolean;
//   name: string;
//   fileId: string;
//   children: DiskCatalogNode[];
// };
//
// export let zDiskCatalogNode: z.ZodType<DiskCatalogNode> = z.lazy(() =>
//   z
//     .object({
//       id: z.string(),
//       isFolder: z.boolean(),
//       name: z.string(),
//       fileId: z.string(),
//       children: z.array(zDiskCatalogNode)
//     })
//     .meta({ id: 'DiskCatalogNode' })
// );

export let zDiskCatalogNode = z
  .object({
    id: z.string(),
    isFolder: z.boolean(),
    name: z.string(),
    fileId: z.string().nullish(),
    get children() {
      return z.array(zDiskCatalogNode).nullish();
    }
  })
  .meta({ id: 'DiskCatalogNode' });

export type DiskCatalogNode = z.infer<typeof zDiskCatalogNode>;
