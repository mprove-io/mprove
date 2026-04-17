import { Injectable } from '@nestjs/common';
import { SKILLS_DATA } from '#common/constants/skills-data';
import type { ToBackendDownloadSkillsResponsePayload } from '#common/zod/to-backend/skills/to-backend-download-skills';

@Injectable()
export class SkillsService {
  async downloadSkills(): Promise<ToBackendDownloadSkillsResponsePayload> {
    let payload: ToBackendDownloadSkillsResponsePayload = {
      skillItems: SKILLS_DATA
    };

    return payload;
  }
}
