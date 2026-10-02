import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetGivensRequest } from '#common/types/backend/routes/givens/get-givens/get-givens-request';
import { zToBackendGetGivensResponse } from '#common/types/backend/routes/givens/get-givens/get-givens-response';

export class ToBackendGetGivensRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetGivensRequest })
) {}

export class ToBackendGetGivensResponseDto extends createBackendResponseDto({
  schema: zToBackendGetGivensResponse
}) {}
