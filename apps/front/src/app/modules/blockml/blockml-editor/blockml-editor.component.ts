import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { ApiService } from '~front/app/services/api.service';
import { RepoStore } from '~front/app/stores/repo.store';

@Component({
  selector: 'm-blockml-editor',
  templateUrl: './blockml-editor.component.html'
})
export class BlockmlEditorComponent {
  code: string;
  code$ = this.fileQuery.content$.pipe(
    tap(x => {
      this.code = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public repoQuery: RepoQuery,
    public fileQuery: FileQuery,
    private cd: ChangeDetectorRef,
    private navQuery: NavQuery,
    private apiService: ApiService,
    private repoStore: RepoStore
  ) {}
}
