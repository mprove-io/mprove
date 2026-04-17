import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateFileRequest,
  zToBackendCreateFileResponse
} from '#common/zod/to-backend/files/to-backend-create-file';

export class ToBackendCreateFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFileRequest })
) {}

export class ToBackendCreateFileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFileResponse })
) {}
