import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, map, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import * as actions from '@app/store/actions/_index';
import * as enums from '@app/enums/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';
import * as services from '@app/services/_index';

@Injectable()
export class FileResolver implements Resolve<boolean> {
  constructor(
    private printer: services.PrinterService,
    private store: Store<interfaces.AppState>,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    this.printer.log(enums.busEnum.FILE_SELECTED_RESOLVER, 'starts...');

    // this.store.select(selectors.getLayoutNeedSave).take(1).subscribe(
    //   x => x ? this.store.dispatch(new SetLayoutNeedSaveFalseAction()) : 0);
    //
    // this.store.select(selectors.getLayoutLineNumber).take(1).subscribe(
    //   x => x ? this.store.dispatch(new UpdateLayoutLineNumberAction(undefined)) : 0);

    this.printer.log(
      enums.busEnum.FILE_SELECTED_RESOLVER,
      'fileId:',
      route.params['fileId']
    );

    let selectedProjectModeRepoId: string;
    this.store
      .select(selectors.getSelectedProjectModeRepoId)
      .pipe(take(1))
      .subscribe(x => (selectedProjectModeRepoId = x));

    if (!selectedProjectModeRepoId) {
      this.printer.log(
        enums.busEnum.FILE_SELECTED_RESOLVER,
        `selectedProjectModeRepoId undefined`
      );
      this.printer.log(
        enums.busEnum.FILE_SELECTED_RESOLVER,
        `resolved (false)`
      );
      return of(false);
    }

    return this.store.select(selectors.getUserLoaded).pipe(
      filter(loaded => loaded),
      take(1),
      switchMap(() => this.hasFileInStore(route.params['fileId']))
    );
  }

  /**
   * This method checks if a file with the given fileId is already registered
   * in the Store and is not Deleted
   */
  hasFileInStore(id: string): Observable<boolean> {
    return this.store.select(selectors.getFilesState).pipe(
      mergeMap(files => {
        let selectedProjectId: string;
        this.store
          .select(selectors.getSelectedProjectId)
          .pipe(take(1))
          .subscribe(x => (selectedProjectId = x));

        let selectedProjectModeRepoId: string;
        this.store
          .select(selectors.getSelectedProjectModeRepoId)
          .pipe(take(1))
          .subscribe(x => (selectedProjectModeRepoId = x));

        let exists =
          files.findIndex(
            file =>
              file.project_id === selectedProjectId &&
              file.repo_id === selectedProjectModeRepoId &&
              file.file_id === id &&
              file.deleted === false
          ) > -1;

        if (!exists) {
          this.printer.log(
            enums.busEnum.FILE_SELECTED_RESOLVER,
            `file not exists, navigating 404...`
          );

          this.store
            .select(selectors.getLayoutFileId)
            .pipe(take(1))
            .subscribe(x =>
              x
                ? this.store.dispatch(
                    new actions.UpdateLayoutFileIdAction(undefined)
                  )
                : 0
            );

          this.router.navigate(['/404']);
          this.printer.log(
            enums.busEnum.FILE_SELECTED_RESOLVER,
            `resolved (false)`
          );
          return of(false);
        } else {
          this.printer.log(enums.busEnum.FILE_SELECTED_RESOLVER, `file exists`);

          let layoutFileId: string;
          this.store
            .select(selectors.getLayoutFileId)
            .pipe(take(1))
            .subscribe(fileId => (layoutFileId = fileId));

          if (id !== layoutFileId) {
            this.printer.log(
              enums.busEnum.FILE_SELECTED_RESOLVER,
              `selecting file...`
            );
            this.store.dispatch(new actions.UpdateLayoutFileIdAction(id));

            return this.store.select(selectors.getLayoutFileId).pipe(
              filter(selectedFileId => selectedFileId === id),
              map(() => true),
              tap(x => {
                this.printer.log(
                  enums.busEnum.FILE_SELECTED_RESOLVER,
                  `file selected`
                );
                this.printer.log(
                  enums.busEnum.FILE_SELECTED_RESOLVER,
                  `resolved (true)`
                );
              }),
              take(1)
            );
          } else {
            this.printer.log(
              enums.busEnum.FILE_SELECTED_RESOLVER,
              `file already selected`
            );
            this.printer.log(
              enums.busEnum.FILE_SELECTED_RESOLVER,
              `resolved (true)`
            );
            return of(true);
          }
        }
      }),
      take(1)
    );
  }
}
