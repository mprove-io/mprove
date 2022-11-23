import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { common } from '~front/barrels/common';
import { FileService } from '../services/file.service';
import { UiState, UiStore } from '../stores/ui.store';

@Injectable({ providedIn: 'root' })
export class FileResolver implements Resolve<Observable<boolean>> {
  constructor(private fileService: FileService, private uiStore: UiStore) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let fileId: string = route.params[common.PARAMETER_FILE_ID];
    let panel: common.PanelEnum = route.queryParams?.panel;

    this.uiStore.update(state =>
      Object.assign({}, state, <UiState>{
        panel: panel || common.PanelEnum.Tree
      })
    );

    return this.fileService
      .getFile({ fileId: fileId, panel: panel })
      .pipe(map(x => true));
  }
}
