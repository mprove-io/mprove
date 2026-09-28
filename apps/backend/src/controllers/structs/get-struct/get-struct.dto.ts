import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetStructRequest } from '#common/zod/backend/routes/structs/get-struct/get-struct-request';
import { zToBackendGetStructResponse } from '#common/zod/backend/routes/structs/get-struct/get-struct-response';

export class ToBackendGetStructRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStructRequest })
) {}

export class ToBackendGetStructResponseDto extends createBackendResponseDto({
  schema: zToBackendGetStructResponse
}) {}
