import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { PanelEnum } from '#common/enums/panel.enum';
import { DiskFileLine } from '#common/interfaces/disk/disk-file-line';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
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
    private repoQuery: RepoQuery,
    private cd: ChangeDetectorRef,
    private navigateService: NavigateService
  ) {}

  goToFileLine(conflict: DiskFileLine) {
    this.navigateService.navigateToFileLine({
      panel: PanelEnum.Tree,
      encodedFileId: conflict.fileId,
      lineNumber: conflict.lineNumber
    });
  }
}
