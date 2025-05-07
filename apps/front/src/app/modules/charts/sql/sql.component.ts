import { ChangeDetectorRef, Component } from '@angular/core';
import { MonacoEditorOptions } from 'ng-monaco-editor';
import { tap } from 'rxjs/operators';
import { ChartQuery } from '~front/app/queries/chart.query';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-sql',
  templateUrl: './sql.component.html'
})
export class SqlComponent {
  editorOptions: MonacoEditorOptions = {
    readOnly: true,
    renderValidationDecorations: 'off',
    theme: constants.TEXTMATE_THEME,
    language: constants.SQL_LANGUAGE_ID,
    fontSize: 16,
    fixedOverflowWidgets: true,
    padding: {
      top: 12
    }
  };

  content: string;

  chart: common.ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;
      this.content = x.tiles[0].query.sql;

      this.cd.detectChanges();
    })
  );

  constructor(private cd: ChangeDetectorRef, private chartQuery: ChartQuery) {}
}
