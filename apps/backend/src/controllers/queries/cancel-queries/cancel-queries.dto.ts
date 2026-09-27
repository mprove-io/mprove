import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCancelQueriesRequest } from '#common/zod/backend/routes/queries/cancel-queries/cancel-queries-request';
import { zToBackendCancelQueriesResponse } from '#common/zod/backend/routes/queries/cancel-queries/cancel-queries-response';

export class ToBackendCancelQueriesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCancelQueriesRequest })
) {}

export class ToBackendCancelQueriesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCancelQueriesResponse })
) {}
