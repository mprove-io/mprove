import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendIsProjectExistRequest } from '#common/zod/backend/routes/projects/is-project-exist/is-project-exist-request';
import { zToBackendIsProjectExistResponse } from '#common/zod/backend/routes/projects/is-project-exist/is-project-exist-response';

export class ToBackendIsProjectExistRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsProjectExistRequest })
) {}

export class ToBackendIsProjectExistResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendIsProjectExistResponse })
) {}
