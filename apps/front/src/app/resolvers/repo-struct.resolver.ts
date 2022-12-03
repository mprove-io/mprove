import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { common } from '~front/barrels/common';
import { RepoStructFilesResolver } from './repo-struct-files.resolver';

@Injectable({ providedIn: 'root' })
export class RepoStructResolver implements Resolve<Observable<boolean>> {
  constructor(private structRepoFilesResolver: RepoStructFilesResolver) {}

  resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Observable<boolean> {
    let isFilesInPath =
      routerStateSnapshot.url
        .split('/')
        .findIndex(el => el === common.PATH_FILES) === 11;

    if (isFilesInPath === true) {
      return of(true);
    } else {
      return this.structRepoFilesResolver.resolve(route);
    }
  }
}
