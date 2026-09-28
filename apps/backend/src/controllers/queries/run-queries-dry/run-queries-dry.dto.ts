import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendRunQueriesDryRequest } from '#common/zod/backend/routes/queries/run-queries-dry/run-queries-dry-request';
import { zToBackendRunQueriesDryResponse } from '#common/zod/backend/routes/queries/run-queries-dry/run-queries-dry-response';

export class ToBackendRunQueriesDryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunQueriesDryRequest })
) {}

export class ToBackendRunQueriesDryResponseDto extends createBackendResponseDto(
  { schema: zToBackendRunQueriesDryResponse }
) {}
