import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-repo-conflicts',
  templateUrl: './repo-conflicts.component.html'
})
export class RepoConflictsComponent {
  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public fileQuery: FileQuery,
    public structQuery: StructQuery,
    public uiQuery: UiQuery,
    public repoQuery: RepoQuery,
    public navQuery: NavQuery,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private repoStore: RepoStore,
    private uiStore: UiStore,
    private navigateService: NavigateService
  ) {}

  goToFileLine(conflict: common.DiskFileLine) {
    this.navigateService.navigateToFileLine({
      underscoreFileId: conflict.fileId,
      lineNumber: conflict.lineNumber
    });
  }
}
