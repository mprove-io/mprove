import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendGetFileRequest } from '#common/types/backend/routes/files/get-file/get-file-request';
import { zToBackendGetFileResponse } from '#common/types/backend/routes/files/get-file/get-file-response';

export class ToBackendGetFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetFileRequest })
) {}

export class ToBackendGetFileResponseDto extends createBackendResponseDto({
  schema: zToBackendGetFileResponse
}) {}
