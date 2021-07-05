import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { TreeNode } from '@circlon/angular-tree-component';
import { tap } from 'rxjs/operators';
import { FileQuery } from '~front/app/queries/file.query';
import { ModelQuery } from '~front/app/queries/model.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { FileService } from '~front/app/services/file.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { FileStore } from '~front/app/stores/file.store';
import { ModelState } from '~front/app/stores/model.store';
import { RepoStore } from '~front/app/stores/repo.store';
import { StructStore } from '~front/app/stores/struct.store';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-query-options',
  templateUrl: './query-options.component.html'
})
export class QueryOptionsComponent implements OnDestroy {
  @Input()
  node: TreeNode;

  menuId = 'queryOptions';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isQueryOptionsMenuOpen = false;

  model: ModelState;
  model$ = this.modelQuery.select().pipe(
    tap(x => {
      this.model = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public uiQuery: UiQuery,
    public fileQuery: FileQuery,
    public modelQuery: ModelQuery,
    public uiStore: UiStore,
    public repoStore: RepoStore,
    public fileStore: FileStore,
    public fileService: FileService,
    public navQuery: NavQuery,
    private navigateService: NavigateService,
    public structStore: StructStore,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  openMenu() {
    this.isQueryOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isQueryOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(event?: MouseEvent) {
    event.stopPropagation();
    if (this.isQueryOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  clearSelection(event?: MouseEvent) {
    event.stopPropagation();
    this.closeMenu();

    this.navigateService.navigateToModel(this.model.modelId);
  }

  ngOnDestroy() {
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
