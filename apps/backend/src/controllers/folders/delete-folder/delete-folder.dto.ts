import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#common/functions/zod-strip-custom';
import {
  zToBackendDeleteFolderRequest,
  zToBackendDeleteFolderResponse
} from '#common/zod/to-backend/folders/to-backend-delete-folder';

export class ToBackendDeleteFolderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteFolderRequest })
) {}

export class ToBackendDeleteFolderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteFolderResponse })
) {}
