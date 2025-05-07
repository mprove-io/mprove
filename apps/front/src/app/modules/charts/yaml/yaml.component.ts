import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { MonacoEditorOptions, MonacoProviderService } from 'ng-monaco-editor';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { ChartQuery } from '~front/app/queries/chart.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

@Component({
  selector: 'm-yaml',
  templateUrl: './yaml.component.html'
})
export class YamlComponent implements OnInit, OnChanges {
  @Input()
  queryPart: common.QueryPartEnum;

  @Input()
  modelFilePath: string;

  prevModelFilePath: string;

  editorOptions: MonacoEditorOptions = {
    readOnly: true,
    renderValidationDecorations: 'off',
    theme: constants.BLOCKML_THEME,
    language: constants.YAML_LANGUAGE_ID,
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

      this.checkContent();
    })
  );

  isShowSpinner = false;
  spinnerName = 'chartsQueryGetFile';

  constructor(
    private cd: ChangeDetectorRef,
    private chartQuery: ChartQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private apiService: ApiService,
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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      common.isDefined(changes.queryPart) &&
      changes.queryPart.currentValue !== changes.queryPart.previousValue
    ) {
      this.queryPart = changes.queryPart.currentValue;
      this.checkContent();
    }
  }

  checkContent() {
    if (common.isDefined(this.chart)) {
      if (this.queryPart === common.QueryPartEnum.TileYaml) {
        this.prevModelFilePath = undefined;

        let filePartTile: common.FilePartTile = common.prepareTile({
          isForDashboard: false,
          mconfig: this.chart.tiles[0].mconfig
        });

        this.content = common.toYaml({ tiles: [filePartTile] });
        this.cd.detectChanges();
      } else if (
        this.queryPart === common.QueryPartEnum.ModelYaml &&
        this.prevModelFilePath !== this.modelFilePath
      ) {
        this.prevModelFilePath = this.modelFilePath;

        let nav = this.navQuery.getValue();

        let getFilePayload: apiToBackend.ToBackendGetFileRequestPayload = {
          projectId: nav.projectId,
          isRepoProd: nav.isRepoProd,
          branchId: nav.branchId,
          envId: nav.envId,
          fileNodeId: this.modelFilePath,
          panel: common.PanelEnum.Tree
        };

        this.isShowSpinner = true;
        this.cd.detectChanges();

        this.spinner.show(this.spinnerName);

        this.apiService
          .req({
            pathInfoName:
              apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetFile,
            payload: getFilePayload,
            showSpinner: false
          })
          .pipe(
            tap((resp: apiToBackend.ToBackendGetFileResponse) => {
              if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
                this.content = resp.payload.content;

                this.spinner.hide(this.spinnerName);
                this.isShowSpinner = false;
                this.cd.detectChanges();
              }
            }),
            take(1)
          )
          .subscribe();
      }
    }
  }
}
