import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendSaveFileRequest,
  zToBackendSaveFileResponse
} from '#common/zod/to-backend/files/to-backend-save-file';

export class ToBackendSaveFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveFileRequest })
) {}

export class ToBackendSaveFileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveFileResponse })
) {}
