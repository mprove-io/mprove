import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetQueriesRequest,
  zToBackendGetQueriesResponse
} from '#common/zod/to-backend/queries/to-backend-get-queries';

export class ToBackendGetQueriesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueriesRequest })
) {}

export class ToBackendGetQueriesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetQueriesResponse })
) {}
