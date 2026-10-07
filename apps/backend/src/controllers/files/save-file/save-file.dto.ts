import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendSaveFileRequest } from '#common/types/backend/routes/files/save-file/save-file-request';
import { zToBackendSaveFileResponse } from '#common/types/backend/routes/files/save-file/save-file-response';

export class ToBackendSaveFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveFileRequest })
) {}

export class ToBackendSaveFileResponseDto extends createBackendResponseDto({
  schema: zToBackendSaveFileResponse
}) {}
