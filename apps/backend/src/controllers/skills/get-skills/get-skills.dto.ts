import { createZodDto } from 'nestjs-zod';
import { zodStripCustom } from '#backend/functions/zod-strip-custom';
import { zToBackendGetSkillsRequest } from '#common/zod/backend/routes/skills/get-skills/get-skills-request';
import { zToBackendGetSkillsResponse } from '#common/zod/backend/routes/skills/get-skills/get-skills-response';

export class ToBackendGetSkillsRequestDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSkillsRequest })
) {}

export class ToBackendGetSkillsResponseDto extends createZodDto(
  zodStripCustom({ schema: zToBackendGetSkillsResponse })
) {}
