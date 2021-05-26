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

@Injectable({ providedIn: 'root' })
export class FileResolver implements Resolve<Observable<boolean>> {
  constructor(private fileService: FileService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let fileId = route.params[common.PARAMETER_FILE_ID];

    return this.fileService.getFile(fileId).pipe(map(x => true));
  }
}
