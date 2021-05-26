import { ChangeDetectorRef, Component } from '@angular/core';
import { tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructState } from '~front/app/stores/struct.store';
import { UiStore } from '~front/app/stores/ui.store';

@Component({
  selector: 'm-blockml-right',
  templateUrl: './blockml-right.component.html'
})
export class BlockmlRightComponent {
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
    public navQuery: NavQuery,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private repoStore: RepoStore,
    private uiStore: UiStore
  ) {}
}
