import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCancelQueriesRequest,
  zToBackendCancelQueriesResponse
} from '#common/zod/to-backend/queries/to-backend-cancel-queries';

export class ToBackendCancelQueriesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCancelQueriesRequest })
) {}

export class ToBackendCancelQueriesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCancelQueriesResponse })
) {}
