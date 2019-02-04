import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import 'brace';
import 'brace/ext/searchbox';
import 'brace/mode/sql';
import 'brace/theme/solarized_dark';
import 'brace/theme/sqlserver';
import { AceEditorComponent } from 'ng2-ace-editor';
import { filter, tap } from 'rxjs/operators';
import * as api from '@app/api/_index';
import * as interfaces from '@app/interfaces/_index';
import * as selectors from '@app/store/selectors/_index';

@Component({
  moduleId: module.id,
  selector: 'm-sql-part',
  templateUrl: 'sql-part.component.html',
  styleUrls: ['sql-part.component.scss']
})
export class SqlPartComponent implements AfterViewInit {
  sqlEditorTheme: string = 'sqlserver';

  @Input() text: string;

  @ViewChild('editor') editor: AceEditorComponent;

  sqlEditorTheme$ = this.store.select(selectors.getUserSqlTheme).pipe(
    filter(v => !!v),
    tap(x => {
      this.sqlEditorTheme =
        x === api.UserSqlThemeEnum.Light ? 'sqlserver' : 'solarized_dark';
      if (this.editor !== null) {
        this.editor.setTheme(this.sqlEditorTheme);
      }
    })
  );

  constructor(private store: Store<interfaces.AppState>) {}

  ngAfterViewInit() {
    this.editor.getEditor().gotoLine(1);
    this.editor.getEditor().navigateLineEnd();

    // TODO: #18-2 update ace later (1 instead of 2 by using this line)
    this.editor.getEditor().$blockScrolling = Infinity;
    this.editor.getEditor().setFontSize(16);

    this.editor.getEditor().renderer.$cursorLayer.element.style.display =
      'none';

    this.editor.setOptions({
      maxLines: Infinity,
      readOnly: true,
      highlightActiveLine: false,
      highlightGutterLine: false
    });

    this.editor.setTheme(this.sqlEditorTheme);

    this.editor.setMode('sql');
  }
}
