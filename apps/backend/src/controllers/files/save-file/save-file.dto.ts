import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendSaveFileRequest } from '#common/zod/backend/routes/files/save-file/save-file-request';
import { zToBackendSaveFileResponse } from '#common/zod/backend/routes/files/save-file/save-file-response';

export class ToBackendSaveFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveFileRequest })
) {}

export class ToBackendSaveFileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendSaveFileResponse })
) {}
