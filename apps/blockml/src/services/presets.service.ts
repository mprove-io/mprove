import { Injectable } from '@nestjs/common';
import { BmlFile } from '~common/_index';

@Injectable()
export class PresetsService {
  private presets: BmlFile[] = [];

  constructor() {}

  setPresets(presets: BmlFile[]): void {
    this.presets = presets;
  }

  getPresets(): Record<string, any> {
    return this.presets;
  }
}
