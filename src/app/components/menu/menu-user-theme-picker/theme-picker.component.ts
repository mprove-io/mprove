import { DOCUMENT } from '@angular/common';
import { Component, Inject, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as configs from 'app/configs/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';

type Theme =
  api.MemberMainThemeEnum |
  api.MemberDashThemeEnum |
  api.MemberFileThemeEnum |
  api.MemberSqlThemeEnum;

interface ThemeAndColor {
  primary: string;
  name: any;
}

interface DocsTheme {
  title: string;
  colors: Theme[];
}

enum ColorIndex {
  MainTheme = 0,
  DashboardBackground = 1,
  FileEditorBackground = 2,
  SqlEditorBackground = 3
}

@Component({
  moduleId: module.id,
  selector: 'm-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss']
})

export class ThemePickerComponent {
  colorLight = '#f1f1f1';
  colorDark = '#1b1e27';

  userMainThemeEnum = api.MemberMainThemeEnum;
  userDashThemeEnum = api.MemberDashThemeEnum;
  userFileThemeEnum = api.MemberFileThemeEnum;
  userSqlThemeEnum = api.MemberSqlThemeEnum;

  mainTheme: api.MemberMainThemeEnum = null;
  mainTheme$ = this.store.select(selectors.getSelectedProjectUserMainTheme)
    .pipe(
      filter(v => !!v),
      tap(mainTheme => {

        if (this.mainTheme) {
          this.renderer.removeClass(this.document.body, this.mainTheme.toString() + this.POSTFIX);
        }
        this.mainTheme = mainTheme;

        this.renderer.addClass(this.document.body, mainTheme.toString() + this.POSTFIX);
      })
    );

  dashTheme: api.MemberDashThemeEnum = null;
  dashTheme$ = this.store.select(selectors.getSelectedProjectUserDashTheme)
    .pipe(
      filter(v => !!v),
      tap(dashTheme => {
        this.dashTheme = dashTheme;
      })
    );

  fileTheme: api.MemberFileThemeEnum = null;
  fileTheme$ = this.store.select(selectors.getSelectedProjectUserFileTheme)
    .pipe(
      filter(v => !!v),
      tap(fileTheme => {
        this.fileTheme = fileTheme;
      })
    );

  sqlTheme: api.MemberSqlThemeEnum = null;
  sqlTheme$ = this.store.select(selectors.getSelectedProjectUserSqlTheme)
    .pipe(
      filter(v => !!v),
      tap(sqlTheme => {
        this.sqlTheme = sqlTheme;
      })
    );

  userMember: api.Member = null;
  userMember$ = this.store.select(selectors.getSelectedProjectUserMember)
    .pipe(
      filter(v => !!v),
      tap(x => {
        this.userMember = x;
      })
    );

  themesAreRestricted$ = this.store.select(selectors.getSelectedProjectThemesRestricted);

  private readonly POSTFIX: string = '-theme';

  constructor(
    @Inject(DOCUMENT) protected document: Document,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    protected renderer: Renderer2,
    protected store: Store<interfaces.AppState>) {
  }

  installMainTheme(mainTheme: api.MemberMainThemeEnum) {
    this.store.dispatch(new actions.EditMemberAction(
      <any>Object.assign({}, this.userMember, { main_theme: mainTheme })
    ));
  }

  installDashTheme(dashTheme: api.MemberDashThemeEnum) {
    this.store.dispatch(new actions.EditMemberAction(
      <any>Object.assign({}, this.userMember, { dash_theme: dashTheme })
    ));
  }

  installFileTheme(fileTheme: api.MemberFileThemeEnum) {
    this.store.dispatch(new actions.EditMemberAction(
      <any>Object.assign({}, this.userMember, { file_theme: fileTheme })
    ));
  }

  installSqlTheme(sqlTheme: api.MemberSqlThemeEnum) {
    this.store.dispatch(new actions.EditMemberAction(
      <any>Object.assign({}, this.userMember, { sql_theme: sqlTheme })
    ));
  }
}
