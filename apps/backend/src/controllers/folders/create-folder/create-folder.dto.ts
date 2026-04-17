import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendCreateFolderRequest,
  zToBackendCreateFolderResponse
} from '#common/zod/to-backend/folders/to-backend-create-folder';

export class ToBackendCreateFolderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFolderRequest })
) {}

export class ToBackendCreateFolderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFolderResponse })
) {}
