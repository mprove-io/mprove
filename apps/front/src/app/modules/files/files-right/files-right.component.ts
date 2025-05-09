/* eslint-disable @typescript-eslint/naming-convention */
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EditorView } from '@codemirror/view';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize, map, take, tap } from 'rxjs/operators';
import { MemberQuery } from '~front/app/queries/member.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery, RepoState } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { UiService } from '~front/app/services/ui.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

let { languages } = require('@codemirror/language-data');

@Component({
  selector: 'm-files-right',
  templateUrl: './files-right.component.html'
})
export class FilesRightComponent implements OnInit {
  languages = languages;

  theme = EditorView.theme({
    '&': {
      backgroundColor: '#FFFFFF', // From light.ts and your colors.editor.background
      color: '#000000', // From light.ts and your colors.editor.foreground
      height: '100%',
      border: '1px solid #D3D3D3', // From light.ts
      borderRadius: '4px',
      overflow: 'auto'
    },
    '.cm-content': {
      fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace", // From light.ts
      fontSize: '16px',
      padding: '12px', // Adjusted from light.ts for VS Code look
      caretColor: '#000000' // From your colors.editorCursor.foreground
    },
    '.cm-line': {
      lineHeight: '1.6' // From light.ts
      // padding: '0 2px'
    },
    '.cm-gutters': {
      backgroundColor: '#FFFFFF', // From light.ts
      color: '#6E6E6E', // Adjusted for readability
      borderRight: 'none', // From light.ts
      padding: '0 8px'
    },
    '.cm-activeLine': {
      backgroundColor: '#00000012' // From your colors.editor.lineHighlightBackground
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'transparent' // From light.ts
    },
    '.cm-selectionBackground': {
      backgroundColor: '#4D97FF54' // From your colors.editor.selectionBackground
    },
    '.cm-matchingBracket': {
      backgroundColor: '#D3D3D3', // Retained from previous theme
      outline: '1px solid #A0A0A0'
    },
    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent', // From light.ts
      border: 'none',
      color: '#BFBFBF' // From your deco.folding
    },
    '.cm-scroller': {
      scrollbarWidth: 'thin', // From light.ts
      '&::-webkit-scrollbar': {
        width: '6px',
        height: '6px'
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#D3D3D3',
        borderRadius: '3px'
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: '#FFFFFF'
      }
    },
    // Syntax highlighting (merged from light.ts, previous theme, and your tokens)
    '.tok-comment': {
      color: '#0066FF', // From your token: comment
      fontStyle: 'italic'
    },
    '.tok-keyword': {
      color: '#0000FF', // From your token: keyword
      fontStyle: 'bold'
    },
    '.tok-storage': {
      color: '#0000FF', // From your token: storage
      fontStyle: 'bold'
    },
    '.tok-number': {
      color: '#0000CD' // From your token: constant.numeric
    },
    '.tok-constant': {
      color: '#C5060B', // From your token: constant
      fontStyle: 'bold'
    },
    '.tok-constant-language': {
      color: '#585CF6', // From your token: constant.language
      fontStyle: 'bold'
    },
    '.tok-variable-language': {
      color: '#318495' // From your token: variable.language
    },
    '.tok-variable': {
      color: '#318495' // From your token: variable.other
    },
    '.tok-string': {
      color: '#036A07' // From your token: string
    },
    '.tok-constant-character-escape': {
      color: '#26B31A' // From your token: constant.character.escape
    },
    '.tok-string-meta-embedded': {
      color: '#26B31A' // From your token: string meta.embedded
    },
    '.tok-meta-preprocessor': {
      color: '#1A921C' // From your token: meta.preprocessor
    },
    '.tok-keyword-control-import': {
      color: '#0C450D', // From your token: keyword.control.import
      fontStyle: 'bold'
    },
    '.tok-function': {
      color: '#0000A2', // From your token: entity.name.function
      fontStyle: 'bold'
    },
    '.tok-support-function': {
      color: '#0000A2', // From your token: support.function.any-method
      fontStyle: 'bold'
    },
    '.tok-typeName': {
      color: '#267F99', // From light.ts (entity.name.type)
      textDecoration: 'underline' // From your token: entity.name.type
    },
    '.tok-inherited-class': {
      fontStyle: 'italic' // From your token: entity.other.inherited-class
    },
    '.tok-parameter': {
      fontStyle: 'italic' // From your token: variable.parameter
    },
    '.tok-storage-type-method': {
      color: '#70727E' // From your token: storage.type.method
    },
    '.tok-section': {
      fontStyle: 'italic' // From your token: meta.section entity.name.section
    },
    '.tok-support-function-any': {
      color: '#3C4C72', // From your token: support.function
      fontStyle: 'bold'
    },
    '.tok-support-class': {
      color: '#6D79DE', // From your token: support.class
      fontStyle: 'bold'
    },
    '.tok-support-type': {
      color: '#6D79DE', // From your token: support.type
      fontStyle: 'bold'
    },
    '.tok-support-constant': {
      color: '#06960E', // From your token: support.constant
      fontStyle: 'bold'
    },
    '.tok-support-variable': {
      color: '#21439C', // From your token: support.variable
      fontStyle: 'bold'
    },
    '.tok-operator': {
      color: '#687687' // From your token: keyword.operator.js
    },
    '.tok-invalid': {
      color: '#FFFFFF', // From your token: invalid
      backgroundColor: '#990000'
    },
    '.tok-invalid-deprecated-trailing-whitespace': {
      backgroundColor: '#FFD0D0' // From your token: invalid.deprecated.trailing-whitespace
    },
    '.tok-source': {
      backgroundColor: '#0000000D' // From your token: text source
    },
    '.tok-string-unquoted': {
      backgroundColor: '#0000000D' // From your token: string.unquoted
    },
    '.tok-meta-embedded': {
      backgroundColor: '#0000000D' // From your token: meta.embedded
    },
    '.tok-source-string-unquoted': {
      backgroundColor: '#0000000F' // From your token: text source string.unquoted
    },
    '.tok-source-source': {
      backgroundColor: '#0000000F' // From your token: text source text source
    },
    '.tok-meta-tag-preprocessor-xml': {
      color: '#68685B' // From your token: meta.tag.preprocessor.xml
    },
    '.tok-meta-tag-metadata-doctype': {
      color: '#888888' // From your token: meta.tag.metadata.doctype
    },
    '.tok-meta-tag': {
      color: '#1C02FF' // From your token: meta.tag
    },
    '.tok-declaration-tag': {
      color: '#1C02FF' // From your token: declaration.tag
    },
    '.tok-tag': {
      fontStyle: 'bold' // From your token: entity.name.tag
    },
    '.tok-attribute-name': {
      fontStyle: 'italic' // From your token: entity.other.attribute-name
    },
    '.tok-markup-heading': {
      color: '#0C07FF', // From your token: markup.heading
      fontStyle: 'bold'
    },
    '.tok-markup-quote': {
      color: '#000000', // From your token: markup.quote
      fontStyle: 'italic'
    },
    '.tok-markup-list': {
      color: '#B90690' // From your token: markup.list
    },
    '.tok-deco-folding': {
      color: '#BFBFBF' // From your token: deco.folding
    },
    '.tok-whitespace': {
      color: '#BFBFBF' // From your colors.editorWhitespace.foreground
    },
    // Additional styles from light.ts for completeness
    '.tok-propertyName': {
      color: '#001080' // From light.ts (variable.other.property)
    },
    '.tok-definition': {
      color: '#001080' // From light.ts (variable.other.constant)
    },
    '.tok-punctuation': {
      color: '#3A3A3A' // From light.ts (punctuation)
    },
    '.tok-string-regexp': {
      color: '#D16969' // From light.ts (string.regexp)
    },
    '.tok-meta-brace': {
      color: '#3A3A3A' // From light.ts (punctuation.brace)
    },
    '.cm-tooltip': {
      backgroundColor: '#F5F5F5', // From light.ts
      color: '#000000',
      border: '1px solid #D3D3D3',
      borderRadius: '3px'
    },
    '.cm-tooltip-autocomplete': {
      '& ul li[aria-selected]': {
        backgroundColor: '#4D97FF54', // Match selectionBackground
        color: '#000000'
      }
    }
  });

  lang: string;

  repo: RepoState;
  repo$ = this.repoQuery.select().pipe(
    tap(x => {
      this.repo = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;

      this.checkSecondFile();
      this.cd.detectChanges();
    })
  );

  prevBranchId: string;
  prevEnvId: string;

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;

      if (
        common.isDefined(this.prevEnvId) &&
        common.isDefined(this.prevBranchId) &&
        (this.prevEnvId !== this.nav.envId ||
          this.prevBranchId !== this.nav.branchId)
      ) {
        this.prevEnvId = this.nav.envId;
        this.prevBranchId = this.nav.branchId;

        this.checkContent();
      }

      this.cd.detectChanges();
    })
  );

  isEditor: boolean;
  isEditor$ = this.memberQuery.isEditor$.pipe(
    tap(x => {
      this.isEditor = x;
      this.cd.detectChanges();
    })
  );

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  spinnerName = 'filesRightGetFile';
  isShowSpinner = false;

  showGoTo = false;

  isSecondFileValid = true;

  secondFileName: string;

  secondFileNodeId: string;
  secondFileNodeId$ = this.uiQuery.secondFileNodeId$.pipe(
    tap(x => {
      this.secondFileNodeId = x;

      if (common.isDefined(this.secondFileNodeId)) {
        let ar = this.secondFileNodeId.split('/');
        this.secondFileName = ar[ar.length - 1];

        this.checkSecondFile();
        this.checkContent();
      } else {
        this.secondFileName = undefined;
        this.uiService.setProjectFileLink();
      }

      this.cd.detectChanges();
    })
  );

  secondFileContent: string;

  constructor(
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private repoQuery: RepoQuery,
    private memberQuery: MemberQuery,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private uiService: UiService,
    private cd: ChangeDetectorRef,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    this.setEditorOptionsLanguage();

    this.cd.detectChanges();
  }

  setEditorOptionsLanguage() {
    if (common.isUndefined(this.secondFileNodeId)) {
      return;
    }

    this.navQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.nav = x;
      });

    this.structQuery
      .select()
      .pipe(take(1))
      .subscribe(x => {
        this.struct = x;
      });

    let mdir = this.struct.mproveDirValue;
    if (common.isDefined(this.struct.mproveDirValue)) {
      if (mdir.substring(0, 1) === '.') {
        mdir = mdir.substring(1);
      }
      if (mdir.substring(0, 1) === '/') {
        mdir = mdir.substring(1);
      }
    }

    let ar = this.secondFileName.split('.');
    let ext = ar.pop();
    let dotExt = `.${ext}`;

    // this.languages.forEach((x: any) => {
    //   console.log(x.name);
    //   console.log('extensions');
    //   console.log(x.extensions);
    // });

    if (
      constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >= 0
    ) {
      this.lang = 'YAML';
    } else {
      let language = this.languages.find(
        (x: any) => x.extensions.indexOf(ext) > -1
      );

      this.lang = language?.name;
    }

    // console.log('ext');
    // console.log(ext);

    // console.log('lang');
    // console.log(this.lang);

    if (
      this.secondFileName === common.MPROVE_CONFIG_FILENAME ||
      ((this.struct.mproveDirValue === common.MPROVE_CONFIG_DIR_DOT_SLASH ||
        (common.isDefined(mdir) &&
          this.secondFileNodeId.split(mdir)[0] === `${this.nav.projectId}/`)) &&
        constants.BLOCKML_EXT_LIST.map(ex => ex.toString()).indexOf(dotExt) >=
          0)
    ) {
      this.showGoTo = true;

      let languageId = constants.YAML_LANGUAGE_ID;
    } else {
      this.showGoTo = false;
    }
  }

  validate() {
    let payload: apiToBackend.ToBackendValidateFilesRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendValidateFiles,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendValidateFilesResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  goTo() {
    let uiState = this.uiQuery.getValue();

    let ar = this.secondFileName.split('.');
    let ext = ar.pop();
    let id = ar.join('.');
    let dotExt = `.${ext}`;

    if (dotExt === common.FileExtensionEnum.View) {
      this.navigateService.navigateToChart({
        modelId: `${common.VIEW_MODEL_PREFIX}_${id}`,
        chartId: common.EMPTY_CHART_ID
      });
    } else if (dotExt === common.FileExtensionEnum.Store) {
      this.navigateService.navigateToChart({
        modelId: `${common.STORE_MODEL_PREFIX}_${id}`,
        chartId: common.EMPTY_CHART_ID
      });
    } else if (dotExt === common.FileExtensionEnum.Model) {
      this.navigateService.navigateToChart({
        modelId: id,
        chartId: common.EMPTY_CHART_ID
      });
    } else if (dotExt === common.FileExtensionEnum.Report) {
      this.navigateService.navigateToReport({ reportId: id });
    } else if (dotExt === common.FileExtensionEnum.Dashboard) {
      this.navigateService.navigateToDashboard({
        dashboardId: id
      });
    } else if (dotExt === common.FileExtensionEnum.Chart) {
      let nav = this.navQuery.getValue();

      let payload: apiToBackend.ToBackendGetChartRequestPayload = {
        projectId: nav.projectId,
        isRepoProd: nav.isRepoProd,
        branchId: nav.branchId,
        envId: nav.envId,
        chartId: id,
        timezone: uiState.timezone
      };

      this.spinner.show(constants.APP_SPINNER_NAME);

      this.apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetChart,
          payload: payload
        })
        .pipe(
          map((resp: apiToBackend.ToBackendGetChartResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              this.memberQuery.update(resp.payload.userMember);

              if (common.isDefined(resp.payload.chart)) {
                this.navigateService.navigateToChart({
                  modelId: resp.payload.chart.modelId,
                  chartId: id
                });
              } else {
                this.spinner.hide(constants.APP_SPINNER_NAME);
              }
            } else {
              this.spinner.hide(constants.APP_SPINNER_NAME);
            }
          }),
          take(1)
        )
        .subscribe();
    }
  }

  closeSecondFile() {
    this.uiQuery.updatePart({ secondFileNodeId: undefined });
  }

  checkSecondFile() {
    let errorFileIds = this.structQuery
      .getValue()
      .errors.map(e =>
        e.lines
          .map(l => l.fileId.split('/').slice(1).join(common.TRIPLE_UNDERSCORE))
          .flat()
      )
      .flat();

    if (common.isDefined(this.secondFileNodeId)) {
      let fileIdAr = this.secondFileNodeId.split('/');
      fileIdAr.shift();

      let secondFileId = fileIdAr.join(common.TRIPLE_UNDERSCORE);

      this.isSecondFileValid = common.isUndefined(secondFileId)
        ? true
        : errorFileIds.indexOf(secondFileId) < 0;
    } else {
      this.isSecondFileValid = true;
    }
  }

  checkContent() {
    if (common.isDefined(this.secondFileNodeId)) {
      let nav = this.navQuery.getValue();

      let fileItems = common.getFileItems({ nodes: this.repo.nodes });

      if (fileItems.map(x => x.fileNodeId).indexOf(this.secondFileNodeId) < 0) {
        setTimeout(
          () => this.uiQuery.updatePart({ secondFileNodeId: undefined }),
          0
        );
      } else {
        let getFilePayload: apiToBackend.ToBackendGetFileRequestPayload = {
          projectId: nav.projectId,
          isRepoProd: nav.isRepoProd,
          branchId: nav.branchId,
          envId: nav.envId,
          fileNodeId: this.secondFileNodeId,
          panel: common.PanelEnum.Tree
        };

        this.isShowSpinner = true;
        this.spinner.show(this.spinnerName);

        this.cd.detectChanges();

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
                let repoState = this.repoQuery.getValue();
                let newRepoState: RepoState = Object.assign(resp.payload.repo, <
                  RepoState
                >{
                  conflicts: repoState.conflicts, // getFile does not check for conflicts
                  repoStatus: repoState.repoStatus // getFile does not use git fetch
                });
                this.repoQuery.update(newRepoState);
                this.structQuery.update(resp.payload.struct);
                this.navQuery.updatePart({
                  needValidate: resp.payload.needValidate
                });

                this.secondFileContent = resp.payload.content;

                this.setEditorOptionsLanguage();

                this.uiService.setProjectFileLink();

                this.cd.detectChanges();
              }
            }),
            take(1),
            finalize(() => {
              this.spinner.hide(this.spinnerName);
              this.isShowSpinner = false;
            })
          )
          .subscribe();
      }
    }
  }
}
