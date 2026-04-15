import { z } from 'zod';
import { zFilterX } from '#common/zod/backend/filter-x';
import { zMconfigField } from '#common/zod/backend/mconfig-field';
import { zMconfig } from '#common/zod/blockml/mconfig';

export let zMconfigX = zMconfig
  .extend({
    fields: z.array(zMconfigField),
    extendedFilters: z.array(zFilterX)
  })
  .meta({ id: 'MconfigX' });

export type MconfigX = z.infer<typeof zMconfigX>;
