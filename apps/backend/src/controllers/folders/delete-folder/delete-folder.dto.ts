import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendDeleteFolderRequest } from '#common/zod/backend/routes/folders/delete-folder/delete-folder-request';
import { zToBackendDeleteFolderResponse } from '#common/zod/backend/routes/folders/delete-folder/delete-folder-response';

export class ToBackendDeleteFolderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendDeleteFolderRequest })
) {}

export class ToBackendDeleteFolderResponseDto extends createBackendResponseDto({
  schema: zToBackendDeleteFolderResponse
}) {}
