import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendValidateFilesRequest,
  zToBackendValidateFilesResponse
} from '#common/zod/to-backend/files/to-backend-validate-files';

export class ToBackendValidateFilesRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendValidateFilesRequest })
) {}

export class ToBackendValidateFilesResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendValidateFilesResponse })
) {}
