import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { ProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';
import { zProjectWeekStart } from '#common/types/backend/parts/project/project-week-start';

export type ToBackendSetProjectWeekStartRequest = {
  operation: 'setProjectWeekStart';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    weekStart: ProjectWeekStart;
  };
};

export let zToBackendSetProjectWeekStartRequest = z
  .strictObject({
    operation: z.literal('setProjectWeekStart'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        weekStart: zProjectWeekStart
      })
      .meta({ id: 'ToBackendSetProjectWeekStartInput' })
  })
  .meta({ id: 'ToBackendSetProjectWeekStartRequest' });

assertTypesEqual<
  ToBackendSetProjectWeekStartRequest,
  z.infer<typeof zToBackendSetProjectWeekStartRequest>
>({ value: true });
