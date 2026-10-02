import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateFileRequest } from '#common/types/backend/routes/files/create-file/create-file-request';
import { zToBackendCreateFileResponse } from '#common/types/backend/routes/files/create-file/create-file-response';

export class ToBackendCreateFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFileRequest })
) {}

export class ToBackendCreateFileResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateFileResponse
}) {}
