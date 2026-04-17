import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { tap } from 'rxjs/operators';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import type { DiskFileLine } from '#common/zod/disk/disk-file-line';
import { RepoQuery, RepoState } from '#front/app/queries/repo.query';
import { NavigateService } from '#front/app/services/navigate.service';

@Component({
  standalone: false,
  selector: 'm-repo-conflicts',
  templateUrl: './repo-conflicts.component.html'
})
export class RepoConflictsComponent {
  @Input() isEditor: boolean;
  @Input() needSave: boolean;
  @Input() isProduction: boolean;

  @Output() validateClick = new EventEmitter<void>();

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
      builderLeft: BuilderLeftEnum.Tree,
      encodedFileId: conflict.fileId,
      lineNumber: conflict.lineNumber
    });
  }
}
