import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetFileRequest } from '#common/zod/backend/routes/files/get-file/get-file-request';
import { zToBackendGetFileResponse } from '#common/zod/backend/routes/files/get-file/get-file-response';

export class ToBackendGetFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetFileRequest })
) {}

export class ToBackendGetFileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetFileResponse })
) {}
