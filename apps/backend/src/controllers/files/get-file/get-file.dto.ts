import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendGetFileRequest,
  zToBackendGetFileResponse
} from '#common/zod/to-backend/files/to-backend-get-file';

export class ToBackendGetFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetFileRequest })
) {}

export class ToBackendGetFileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetFileResponse })
) {}
