import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { DiskFileLine } from '#common/interfaces/disk/disk-file-line';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { NavigateService } from '#front/app/services/navigate.service';
import { UiService } from '#front/app/services/ui.service';

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
    private navigateService: NavigateService,
    private uiService: UiService
  ) {}

  goToFileLine(conflict: DiskFileLine) {
    this.uiService.ensureFilesLeftPanel();
    this.navigateService.navigateToFileLine({
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: conflict.fileId,
      lineNumber: conflict.lineNumber
    });
  }
}
