import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { take, tap } from 'rxjs/operators';
import type { Role } from '#common/zod/backend/role';
import type { ToBackendDeleteRoleInput } from '#common/zod/backend/routes/roles/delete-role/delete-role-request';
import type { ToBackendDeleteRoleResponse } from '#common/zod/backend/routes/roles/delete-role/delete-role-response';
import { MemberQuery } from '#front/app/queries/member.query';
import { RolesQuery } from '#front/app/queries/roles.query';
import type { ApiService } from '#front/app/services/api.service';

export interface DeleteProjectRoleDialogData {
  apiService: ApiService;
  role: Role;
}

@Component({
  selector: 'm-delete-project-role-dialog',
  templateUrl: './delete-project-role-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteProjectRoleDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: DeleteProjectRoleDialogData = this.ref.data;

  constructor(
    public ref: DialogRef<DeleteProjectRoleDialogData>,
    private memberQuery: MemberQuery,
    private rolesQuery: RolesQuery
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    this.ref.close();

    let payload: ToBackendDeleteRoleInput = {
      projectId: this.dataItem.role.projectId,
      roleId: this.dataItem.role.roleId
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        route: 'api/ToBackendDeleteRole',
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteRoleResponse) => {
          if (resp.result?.type === 'Success') {
            this.memberQuery.update(resp.result.value.userMember);
            this.rolesQuery.update({ roles: resp.result.value.roles });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
