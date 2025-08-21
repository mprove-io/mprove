import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { NavigateService } from '~front/app/services/navigate.service';

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
    private fileQuery: FileQuery,
    private structQuery: StructQuery,
    private repoQuery: RepoQuery,
    private navQuery: NavQuery,
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
