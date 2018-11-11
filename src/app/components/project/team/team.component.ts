import { Component, OnDestroy } from '@angular/core';
import { ITdDataTableColumn } from '@covalent/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import * as actions from 'src/app/store/actions/_index';
import * as configs from 'src/app/configs/_index';
import * as interfaces from 'src/app/interfaces/_index';
import * as selectors from 'src/app/store/selectors/_index';
import * as services from 'src/app/services/_index';

@Component({
  moduleId: module.id,
  selector: 'm-team',
  styleUrls: ['team.component.scss'],
  templateUrl: 'team.component.html'
})

export class TeamComponent implements OnDestroy {

  dynamicAssetsBaseUrl: string = configs.pathConfig.dynamicAssetsBaseUrl;
  userId: string;
  userId$ = this.store.select(selectors.getUserId)
    .pipe(
      filter(v => !!v),
      tap(id => this.userId = id)
    );

  selectedProjectUserIsAdmin: boolean;
  selectedProjectUserIsAdmin$ = this.store.select(selectors.getSelectedProjectUserIsAdmin)
    .pipe(
      tap(x => this.selectedProjectUserIsAdmin = x) // no filter here
    );

  selectedProjectId$ = this.store.select(selectors.getSelectedProjectId)
    .pipe(filter(v => !!v));

  selectedProjectMembers$ = this.store.select(selectors.getSelectedProjectMembers)
    .pipe(
      filter(v => !!v),
      map(members => members.sort((a: any, b: any) => { // sorted by member_id
        return (a.member_id > b.member_id) ? 1 : ((b.member_id > a.member_id) ? -1 : 0);
      }))
    );

  columns: ITdDataTableColumn[] = [
    // { name: 'picture', label: '', tooltip: 'Stock Keeping Unit' },
    // { name: 'member_id', label: '', numeric: true, format: v => v.toFixed(2) },
    { name: 'picture', label: '', width: 50 },
    { name: 'name', label: 'name' },
    { name: 'member_id', label: 'email' },
    { name: 'alias', label: 'alias' },
    { name: 'is_admin', label: 'admin', width: 100 },
    { name: 'is_editor', label: 'editor', width: 100 },
    { name: 'status', label: 'status', width: 100 },
    { name: 'delete', label: '', width: 70 },
  ];

  titlePageSub: Subscription;

  constructor(
    private store: Store<interfaces.AppState>,
    private pageTitle: services.PageTitleService,
    private myDialogService: services.MyDialogService,
  ) {

    this.titlePageSub = this.pageTitle.setProjectSubtitle('Team');
  }

  ngOnDestroy() {
    this.titlePageSub.unsubscribe();
  }

  openInviteMemberDialog() {
    this.myDialogService.showInviteMemberDialog();
  }

  isAdminToggle(row: any) {
    if (this.selectedProjectUserIsAdmin && row.member_id !== this.userId) {
      this.store.dispatch(new actions.EditMemberAction({
        project_id: row.project_id,
        member_id: row.member_id,
        is_editor: row.is_editor,
        is_admin: !row.is_admin,
        main_theme: row.main_theme,
        dash_theme: row.dash_theme,
        file_theme: row.file_theme,
        sql_theme: row.sql_theme,
        server_ts: row.server_ts
      }));
    }
  }

  openMemberBigPicture(row: any) {
    this.myDialogService.showMemberPictureDialog({ row: row });
  }

  isEditorToggle(row: any) {
    if (this.selectedProjectUserIsAdmin) {
      this.store.dispatch(new actions.EditMemberAction({
        project_id: row.project_id,
        member_id: row.member_id,
        is_editor: !row.is_editor,
        is_admin: row.is_admin,
        main_theme: row.main_theme,
        dash_theme: row.dash_theme,
        file_theme: row.file_theme,
        sql_theme: row.sql_theme,
        server_ts: row.server_ts
      }));
    }
  }

  deleteMember(row: any) {
    this.store.dispatch(new actions.DeleteMemberAction({
      project_id: row.project_id,
      member_id: row.member_id,
      server_ts: row.server_ts
    }));
  }
}
