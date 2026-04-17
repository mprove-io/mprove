import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendRunQueriesRequest,
  zToBackendRunQueriesResponse
} from '#common/zod/to-backend/queries/to-backend-run-queries';

export class ToBackendRunQueriesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunQueriesRequest })
) {}

export class ToBackendRunQueriesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunQueriesResponse })
) {}
