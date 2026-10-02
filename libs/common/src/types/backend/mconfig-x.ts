import { z } from 'zod';
import { zFilterX } from '#common/types/backend/filter-x';
import { zMconfigField } from '#common/types/backend/mconfig-field';
import { zMconfig } from '#common/types/blockml/mconfig';

export let zMconfigX = zMconfig
  .extend({
    fields: z.array(zMconfigField),
    extendedFilters: z.array(zFilterX)
  })
  .meta({ id: 'MconfigX' });

export type MconfigX = z.infer<typeof zMconfigX>;
