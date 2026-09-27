import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateFolderRequest } from '#common/zod/backend/routes/folders/create-folder/create-folder-request';
import { zToBackendCreateFolderResponse } from '#common/zod/backend/routes/folders/create-folder/create-folder-response';

export class ToBackendCreateFolderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFolderRequest })
) {}

export class ToBackendCreateFolderResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFolderResponse })
) {}
