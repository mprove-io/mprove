import { Injectable } from '@nestjs/common';
import { BmlFile } from '~common/_index';

@Injectable()
export class PresetsService {
  presets: BmlFile[] = [];

  constructor() {}

  setPresets(presets: BmlFile[]) {
    this.presets = presets;
  }

  getPresets(): BmlFile[] {
    return this.presets;
  }
}
