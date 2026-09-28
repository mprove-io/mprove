import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteFileRequest } from '#common/zod/backend/routes/files/delete-file/delete-file-request';
import { zToBackendDeleteFileResponse } from '#common/zod/backend/routes/files/delete-file/delete-file-response';

export class ToBackendDeleteFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteFileRequest })
) {}

export class ToBackendDeleteFileResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteFileResponse
}) {}
