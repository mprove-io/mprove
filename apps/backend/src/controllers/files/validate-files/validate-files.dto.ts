import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendValidateFilesRequest } from '#common/types/backend/routes/files/validate-files/validate-files-request';
import { zToBackendValidateFilesResponse } from '#common/types/backend/routes/files/validate-files/validate-files-response';

export class ToBackendValidateFilesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendValidateFilesRequest })
) {}

export class ToBackendValidateFilesResponseDto extends createBackendResponseDto(
  { schema: zToBackendValidateFilesResponse }
) {}
