import { z } from 'zod';
import { zDashboardUnit } from '#common/zod/backend/dashboard-unit';

export let zDashboardPart = zDashboardUnit.meta({ id: 'DashboardPart' });

export type DashboardPart = z.infer<typeof zDashboardPart>;
