import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from '@angular/router';
import { common } from '~front/barrels/common';
import { StructRepoFilesResolver } from './struct-repo-files.resolver';

@Injectable({ providedIn: 'root' })
export class StructRepoResolver implements Resolve<Promise<boolean>> {
  constructor(private structRepoFilesResolver: StructRepoFilesResolver) {}

  async resolve(
    route: ActivatedRouteSnapshot,
    routerStateSnapshot: RouterStateSnapshot
  ): Promise<boolean> {
    let isFilesInPath =
      routerStateSnapshot.url
        .split('/')
        .findIndex(el => el === common.PATH_FILES) === 11;

    if (isFilesInPath === true) {
      return true;
    } else {
      return this.structRepoFilesResolver.resolve(route);
    }
  }
}
