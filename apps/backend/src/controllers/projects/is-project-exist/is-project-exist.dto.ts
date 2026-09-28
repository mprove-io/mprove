import { createZodDto } from 'nestjs-zod';
import { createBackendResponseDto } from '#backend/functions/create-backend-response-dto';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendIsProjectExistRequest } from '#common/zod/backend/routes/projects/is-project-exist/is-project-exist-request';
import { zToBackendIsProjectExistResponse } from '#common/zod/backend/routes/projects/is-project-exist/is-project-exist-response';

export class ToBackendIsProjectExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsProjectExistRequest })
) {}

export class ToBackendIsProjectExistResponseDto extends createBackendResponseDto(
  { schema: zToBackendIsProjectExistResponse }
) {}
