import { z } from 'zod';
import { zSessionApi } from '#common/types/backend/session-api';

export let zSessionApiX = zSessionApi
  .extend({
    displayTitle: z.string(),
    providerLabel: z.string()
  })
  .meta({ id: 'SessionApiX' });

export type SessionApiX = z.infer<typeof zSessionApiX>;
