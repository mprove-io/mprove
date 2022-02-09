import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { RepoState } from '~front/app/stores/repo.store';
import { StructState } from '~front/app/stores/struct.store';

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
    public repoQuery: RepoQuery,
    public navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}
}
