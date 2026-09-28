import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetFileRequest } from '#common/zod/backend/routes/files/get-file/get-file-request';
import { zToBackendGetFileResponse } from '#common/zod/backend/routes/files/get-file/get-file-response';

export class ToBackendGetFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetFileRequest })
) {}

export class ToBackendGetFileResponseDto extends createBackendResponseDto({
  schema: zToBackendGetFileResponse
}) {}
