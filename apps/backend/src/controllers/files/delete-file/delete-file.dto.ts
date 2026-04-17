import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteFileRequest,
  zToBackendDeleteFileResponse
} from '#common/zod/to-backend/files/to-backend-delete-file';

export class ToBackendDeleteFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteFileRequest })
) {}

export class ToBackendDeleteFileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteFileResponse })
) {}
