import { Component, Input } from '@angular/core';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { encodeFilePath } from '#common/functions/encode-file-path';
import type { SpaceFolder } from '#common/zod/backend/space-folder';
import { UiQuery } from '#front/app/queries/ui.query';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-space-options',
  templateUrl: './space-options.component.html'
})
export class SpaceOptionsComponent {
  @Input()
  spaceFolder: SpaceFolder;

  constructor(
    private navigateService: NavigateService,
    private uiQuery: UiQuery
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  goToFile(event: MouseEvent) {
    event.stopPropagation();

    this.uiQuery.updatePart({ secondFileNodeId: undefined });

    let fileIdAr = this.spaceFolder.filePath.split('/');
    fileIdAr.shift();

    let filePath = fileIdAr.join('/');

    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: encodeFilePath({ filePath: filePath }),
      lineNumber: 0
    });
  }
}
