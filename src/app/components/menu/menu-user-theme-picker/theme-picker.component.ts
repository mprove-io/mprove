import { DOCUMENT } from '@angular/common';
import { Component, Inject, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { filter, tap, take } from 'rxjs/operators';
import * as actions from '@app/store-actions/actions';
import * as api from '@app/api/_index';
import * as configs from '@app/configs/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store-selectors/_index';

type Theme =
  | api.UserMainThemeEnum
  | api.UserDashThemeEnum
  | api.UserFileThemeEnum
  | api.UserSqlThemeEnum;

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

  userMainThemeEnum = api.UserMainThemeEnum;
  userDashThemeEnum = api.UserDashThemeEnum;
  userFileThemeEnum = api.UserFileThemeEnum;
  userSqlThemeEnum = api.UserSqlThemeEnum;

  mainTheme: api.UserMainThemeEnum = null;
  mainTheme$ = this.store.select(selectors.getUserMainTheme).pipe(
    filter(v => !!v),
    tap(mainTheme => {
      if (this.mainTheme) {
        this.renderer.removeClass(
          this.document.body,
          this.mainTheme.toString() + this.POSTFIX
        );
      }
      this.mainTheme = mainTheme;

      this.renderer.addClass(
        this.document.body,
        mainTheme.toString() + this.POSTFIX
      );
    })
  );

  dashTheme: api.UserDashThemeEnum = null;
  dashTheme$ = this.store.select(selectors.getUserDashTheme).pipe(
    filter(v => !!v),
    tap(dashTheme => {
      this.dashTheme = dashTheme;
    })
  );

  fileTheme: api.UserFileThemeEnum = null;
  fileTheme$ = this.store.select(selectors.getUserFileTheme).pipe(
    filter(v => !!v),
    tap(fileTheme => {
      this.fileTheme = fileTheme;
    })
  );

  sqlTheme: api.UserSqlThemeEnum = null;
  sqlTheme$ = this.store.select(selectors.getUserSqlTheme).pipe(
    filter(v => !!v),
    tap(sqlTheme => {
      this.sqlTheme = sqlTheme;
    })
  );

  private readonly POSTFIX: string = '-theme';

  constructor(
    @Inject(DOCUMENT) protected document: Document,
    @Inject(configs.APP_CONFIG) public appConfig: interfaces.AppConfig,
    protected renderer: Renderer2,
    protected store: Store<interfaces.AppState>
  ) {}

  installDashTheme(dashTheme: api.UserDashThemeEnum) {
    this.setUserThemes({ dash_theme: dashTheme });
  }

  installFileTheme(fileTheme: api.UserFileThemeEnum) {
    this.setUserThemes({ file_theme: fileTheme });
  }

  installMainTheme(mainTheme: api.UserMainThemeEnum) {
    this.setUserThemes({ main_theme: mainTheme });
  }

  installSqlTheme(sqlTheme: api.UserSqlThemeEnum) {
    this.setUserThemes({ sql_theme: sqlTheme });
  }

  setUserThemes(item: {
    dash_theme?: api.UserDashThemeEnum;
    file_theme?: api.UserFileThemeEnum;
    main_theme?: api.UserMainThemeEnum;
    sql_theme?: api.UserSqlThemeEnum;
  }) {
    let user: api.User;

    this.store
      .select(selectors.getUserState)
      .pipe(take(1))
      .subscribe(x => {
        user = x;
      });

    this.store.dispatch(
      new actions.SetUserThemesAction({
        dash_theme: item.dash_theme || user.dash_theme,
        file_theme: item.file_theme || user.file_theme,
        main_theme: item.main_theme || user.main_theme,
        sql_theme: item.sql_theme || user.sql_theme,
        server_ts: user.server_ts
      })
    );
  }
}
