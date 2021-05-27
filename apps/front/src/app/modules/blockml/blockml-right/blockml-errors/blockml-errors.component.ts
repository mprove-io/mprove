import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { getFileExtension } from '~front/app/functions/get-file-extension';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { StructState } from '~front/app/stores/struct.store';
import { common } from '~front/barrels/common';

export class BmlErrorExtra extends common.BmlError {
  errorExt: any;
  sortOrder: number;
}

@Component({
  selector: 'm-blockml-errors',
  templateUrl: './blockml-errors.component.html'
})
export class BlockmlErrorsComponent {
  errors: BmlErrorExtra[];

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;

      this.errors = x.errors
        .map(error => {
          let errorExt = getFileExtension(error.lines[0].fileId);

          return Object.assign({}, error, <BmlErrorExtra>{
            errorExt: errorExt,
            sortOrder: this.errorSortOrder(errorExt)
          });
        })
        .sort((a, b) => {
          if (a.sortOrder < b.sortOrder) {
            return -1;
          } else if (a.sortOrder > b.sortOrder) {
            return 1;
          } else {
            return 0;
          }
        });

      this.cd.detectChanges();
    })
  );

  constructor(
    public fileQuery: FileQuery,
    public structQuery: StructQuery,
    public uiQuery: UiQuery,
    public navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  errorSortOrder(errorExt: string): number {
    let ext = `.${errorExt}`;

    switch (ext) {
      case 'other':
        return 1;
      case common.FileExtensionEnum.Udf:
        return 2;
      case common.FileExtensionEnum.View:
        return 3;
      case common.FileExtensionEnum.Model:
        return 4;
      case common.FileExtensionEnum.Viz:
        return 5;
      case common.FileExtensionEnum.Dashboard:
        return 6;
      case common.FileExtensionEnum.Conf:
        return 7;
      case common.FileExtensionEnum.Md:
        return 8;
      default:
        return 0;
    }
  }
}
