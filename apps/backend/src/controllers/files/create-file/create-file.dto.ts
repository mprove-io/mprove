import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateFileRequest } from '#common/zod/backend/routes/files/create-file/create-file-request';
import { zToBackendCreateFileResponse } from '#common/zod/backend/routes/files/create-file/create-file-response';

export class ToBackendCreateFileRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFileRequest })
) {}

export class ToBackendCreateFileResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFileResponse })
) {}
