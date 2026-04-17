import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendRunQueriesDryRequest,
  zToBackendRunQueriesDryResponse
} from '#common/zod/to-backend/queries/to-backend-run-queries-dry';

export class ToBackendRunQueriesDryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunQueriesDryRequest })
) {}

export class ToBackendRunQueriesDryResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunQueriesDryResponse })
) {}
