import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MonacoEditorOptions, MonacoProviderService } from 'ng-monaco-editor';
import { tap } from 'rxjs/operators';
import { ChartQuery } from '~front/app/queries/chart.query';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-yaml',
  templateUrl: './yaml.component.html'
})
export class YamlComponent implements OnInit {
  @Input()
  queryPart: common.QueryPartEnum;

  editorOptions: MonacoEditorOptions = {
    readOnly: true,
    renderValidationDecorations: 'off',
    theme: constants.BLOCKML_THEME,
    language: constants.YAML_LANGUAGE_ID,
    fontSize: 16,
    fixedOverflowWidgets: true
  };

  content: string;

  chart: common.ChartX;
  chart$ = this.chartQuery.select().pipe(
    tap(x => {
      this.chart = x;

      let filePartTile: common.FilePartTile = common.prepareTile({
        isForDashboard: false,
        mconfig: x.tiles[0].mconfig
      });

      this.content = common.toYaml({ tiles: [filePartTile] });

      this.cd.detectChanges();
    })
  );

  constructor(
    private cd: ChangeDetectorRef,
    private chartQuery: ChartQuery,
    private monacoService: MonacoProviderService
  ) {}

  async ngOnInit() {
    let monaco = await this.monacoService.initMonaco();

    monaco.languages.setMonarchTokensProvider(
      constants.YAML_LANGUAGE_ID,
      constants.BLOCKML_LANGUAGE_DATA
    );

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }
}
