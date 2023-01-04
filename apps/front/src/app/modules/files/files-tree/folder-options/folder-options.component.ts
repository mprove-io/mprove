import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { TreeNode } from '@bugsplat/angular-tree-component';
import { tap } from 'rxjs/operators';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';

@Component({
  selector: 'm-folder-options',
  templateUrl: './folder-options.component.html'
})
export class FolderOptionsComponent {
  @Input()
  node: TreeNode;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private apiService: ApiService
  ) {}

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }

  newFolder(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showCreateFolder({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      parentNodeId: node.data.id
    });
  }

  newFile(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showCreateFile({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      parentNodeId: node.data.id
    });
  }

  deleteFolder(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showDeleteFolder({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      folderNodeId: node.data.id,
      folderName: node.data.name
    });
  }

  renameFolder(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showRenameFolder({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      nodeId: node.data.id,
      folderName: node.data.name
    });
  }
}
