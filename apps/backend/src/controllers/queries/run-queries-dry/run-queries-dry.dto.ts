import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendRunQueriesDryRequest } from '#common/types/backend/routes/queries/run-queries-dry/run-queries-dry-request';
import { zToBackendRunQueriesDryResponse } from '#common/types/backend/routes/queries/run-queries-dry/run-queries-dry-response';

export class ToBackendRunQueriesDryRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendRunQueriesDryRequest })
) {}

export class ToBackendRunQueriesDryResponseDto extends createBackendResponseDto(
  { schema: zToBackendRunQueriesDryResponse }
) {}
