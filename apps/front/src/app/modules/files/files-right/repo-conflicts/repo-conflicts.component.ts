import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { NavigateService } from '~front/app/services/navigate.service';
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
    public repoQuery: RepoQuery,
    public navQuery: NavQuery,
    private cd: ChangeDetectorRef,
    private navigateService: NavigateService
  ) {}

  goToFileLine(conflict: common.DiskFileLine) {
    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: conflict.fileId,
      lineNumber: conflict.lineNumber
    });
  }
}
