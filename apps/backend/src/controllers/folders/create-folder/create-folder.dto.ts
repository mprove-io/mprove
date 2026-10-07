import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/top/create-backend-response-dto/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod/zod-strip-custom/zod-strip-custom';
import { zToBackendCreateFolderRequest } from '#common/types/backend/routes/folders/create-folder/create-folder-request';
import { zToBackendCreateFolderResponse } from '#common/types/backend/routes/folders/create-folder/create-folder-response';

export class ToBackendCreateFolderRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendCreateFolderRequest })
) {}

export class ToBackendCreateFolderResponseDto extends createBackendResponseDto({
  schema: zToBackendCreateFolderResponse
}) {}
