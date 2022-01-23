import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { RepoState, RepoStore } from '~front/app/stores/repo.store';
import { StructState } from '~front/app/stores/struct.store';
import { UiStore } from '~front/app/stores/ui.store';

@Component({
  selector: 'm-files-right',
  templateUrl: './files-right.component.html'
})
export class FilesRightComponent {
  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
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
    private uiStore: UiStore
  ) {}
}
