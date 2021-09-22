import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TreeNode } from '@circlon/angular-tree-component';
import { tap } from 'rxjs/operators';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { AuthService } from '~front/app/services/auth.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavState } from '~front/app/stores/nav.store';
import { UiStore } from '~front/app/stores/ui.store';
import { common } from '~front/barrels/common';

@Component({
  selector: 'm-folder-options',
  templateUrl: './folder-options.component.html'
})
export class FolderOptionsComponent implements OnDestroy {
  @Input()
  node: TreeNode;

  menuId = 'folderOptions';

  openedMenuId: string;
  openedMenuId$ = this.uiQuery.openedMenuId$.pipe(
    tap(x => (this.openedMenuId = x))
  );

  isFolderOptionsMenuOpen = false;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public uiQuery: UiQuery,
    public uiStore: UiStore,
    public navQuery: NavQuery,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private apiService: ApiService
  ) {}

  openMenu() {
    this.isFolderOptionsMenuOpen = true;
    this.uiStore.update({ openedMenuId: this.menuId });
  }

  closeMenu(event?: MouseEvent) {
    if (common.isDefined(event)) {
      event.stopPropagation();
    }
    this.isFolderOptionsMenuOpen = false;
    this.uiStore.update({ openedMenuId: undefined });
  }

  toggleMenu(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    if (this.isFolderOptionsMenuOpen === true) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  newFolder(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showCreateFolder({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      parentNodeId: node.data.id
    });
    this.closeMenu();
  }

  newFile(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showCreateFile({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      parentNodeId: node.data.id
    });
    this.closeMenu();
  }

  deleteFolder(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showDeleteFolder({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      folderNodeId: node.data.id,
      folderName: node.data.name
    });
    this.closeMenu();
  }

  renameFolder(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showRenameFolder({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      nodeId: node.data.id,
      folderName: node.data.name
    });
    this.closeMenu();
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyRepoOptions');
    if (this.menuId === this.openedMenuId)
      this.uiStore.update({ openedMenuId: undefined });
  }
}
