import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetStructRequest } from '#common/types/backend/routes/structs/get-struct/get-struct-request';
import { zToBackendGetStructResponse } from '#common/types/backend/routes/structs/get-struct/get-struct-response';

export class ToBackendGetStructRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetStructRequest })
) {}

export class ToBackendGetStructResponseDto extends createBackendResponseDto({
  schema: zToBackendGetStructResponse
}) {}
