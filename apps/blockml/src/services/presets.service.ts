import { Injectable } from '@nestjs/common';
import { Preset } from '~blockml/interfaces/preset';

@Injectable()
export class PresetsService {
  presets: Preset[] = [];

  constructor() {}

  setPresets(presets: Preset[]) {
    this.presets = presets;
  }

  getPresets(): Preset[] {
    return this.presets;
  }
}
