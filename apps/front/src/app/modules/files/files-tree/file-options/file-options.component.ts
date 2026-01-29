import { TreeNode } from '@ali-hm/angular-tree-component';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { ApiService } from '#front/app/services/api.service';
import { AuthService } from '#front/app/services/auth.service';
import { MyDialogService } from '#front/app/services/my-dialog.service';

@Component({
  standalone: false,
  selector: 'm-file-options',
  templateUrl: './file-options.component.html'
})
export class FileOptionsComponent {
  @Input()
  node: TreeNode;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  needSave = false;
  needSave$ = this.uiQuery.needSave$.pipe(tap(x => (this.needSave = x)));

  constructor(
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    private myDialogService: MyDialogService,
    private apiService: ApiService
  ) {}

  deleteFile(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showDeleteFile({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fileNodeId: node.data.id,
      fileName: node.data.name
    });
  }

  renameFile(node: TreeNode, event: MouseEvent) {
    event.stopPropagation();
    this.myDialogService.showRenameFile({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      nodeId: node.data.id,
      fileName: node.data.name
    });
  }

  clickMenu(event: MouseEvent) {
    event.stopPropagation();
  }
}
