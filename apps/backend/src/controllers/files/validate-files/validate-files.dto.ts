import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendValidateFilesRequest } from '#common/zod/backend/routes/files/validate-files/validate-files-request';
import { zToBackendValidateFilesResponse } from '#common/zod/backend/routes/files/validate-files/validate-files-response';

export class ToBackendValidateFilesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendValidateFilesRequest })
) {}

export class ToBackendValidateFilesResponseDto extends createBackendResponseDto(
  { schema: zToBackendValidateFilesResponse }
) {}
