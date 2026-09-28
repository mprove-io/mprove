import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendCreateFolderRequest } from '#common/zod/backend/routes/folders/create-folder/create-folder-request';
import { zToBackendCreateFolderResponse } from '#common/zod/backend/routes/folders/create-folder/create-folder-response';

export class ToBackendCreateFolderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFolderRequest })
) {}

export class ToBackendCreateFolderResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateFolderResponse
}) {}
