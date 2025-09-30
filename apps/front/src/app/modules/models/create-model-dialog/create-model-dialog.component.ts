import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { EMPTY_CHART_ID, MPROVE_USERS_FOLDER } from '~common/constants/top';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { PanelEnum } from '~common/enums/panel.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { encodeFilePath } from '~common/functions/encode-file-path';
import { isUndefined } from '~common/functions/is-undefined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { Preset } from '~common/interfaces/blockml/preset';
import {
  ToBackendGetConnectionsRequestPayload,
  ToBackendGetConnectionsResponse
} from '~common/interfaces/to-backend/connections/to-backend-get-connections';
import {
  ToBackendCreateFileRequestPayload,
  ToBackendCreateFileResponse
} from '~common/interfaces/to-backend/files/to-backend-create-file';
import {
  ToBackendGetModelsRequestPayload,
  ToBackendGetModelsResponse
} from '~common/interfaces/to-backend/models/to-backend-get-models';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { SharedModule } from '../../shared/shared.module';

export interface CreateModelDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-create-model-dialog',
  templateUrl: './create-model-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
    NgxSpinnerModule
  ]
})
export class CreateModelDialogComponent implements OnInit {
  // @HostListener('window:keyup.esc')
  // onEscKeyUp() {
  //   this.ref.close();
  // }

  @ViewChild('modelName') modelNameElement: ElementRef;

  usersFolder = MPROVE_USERS_FOLDER;

  modelNameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.maxLength(255), Validators.required]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  connectionTypeEnumApi = ConnectionTypeEnum.Api;
  connectionTypeEnumGoogleApi = ConnectionTypeEnum.GoogleApi;

  connectionForm: FormGroup = new FormGroup({
    connection: new FormControl<ProjectConnection>(undefined, {
      validators: [Validators.required]
    })
  });

  connectionsSpinnerName = 'modelsAddConnectionSpinnerName';

  connections: ProjectConnection[] = [];
  connectionsLoading = false;
  connectionsLoaded = false;

  emptyPreset: Preset = {
    presetId: undefined,
    label: 'Empty',
    path: undefined,
    parsedContent: undefined
  };

  presetForm: FormGroup = new FormGroup({
    preset: new FormControl<Preset>(this.emptyPreset)
  });

  presets: Preset[] = [];

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;

      this.presets = [this.emptyPreset, ...x.presets];

      this.cd.detectChanges();
    })
  );

  formsError: string;

  constructor(
    public ref: DialogRef<CreateModelDialogData>,
    private fb: FormBuilder,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private repoQuery: RepoQuery,
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setTimeout(() => {
      if (this.connectionsLoaded === false) {
        this.loadConnections();
      }
    }, 0);

    // setTimeout(() => {
    //   this.modelNameElement.nativeElement.focus();
    // }, 0);
  }

  loadConnections() {
    this.connectionsLoading = true;

    let nav = this.navQuery.getValue();

    let payload: ToBackendGetConnectionsRequestPayload = {
      projectId: nav.projectId,
      envId: nav.envId
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.connectionsSpinnerName);

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetConnections,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetConnectionsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.connections = resp.payload.connections;

            this.connectionsLoading = false;
            this.connectionsLoaded = true;

            this.spinner.hide(this.connectionsSpinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();
  }

  connectionChange() {
    (document.activeElement as HTMLElement).blur();

    this.formsError = undefined;

    if (
      [ConnectionTypeEnum.Api, ConnectionTypeEnum.GoogleApi].indexOf(
        this.connectionForm.controls['connection'].value.type
      ) < 0
    ) {
      this.presetForm.controls['preset'].setValue(this.emptyPreset);
    } else if (
      this.connectionForm.controls['connection'].value.type ===
        ConnectionTypeEnum.GoogleApi &&
      this.presetForm.controls['preset'].value?.presetId !== 'google_analytics'
    ) {
      let presetGA = this.presets.find(x => x.presetId === 'google_analytics');
      this.presetForm.controls['preset'].setValue(presetGA);
    } else if (
      this.connectionForm.controls['connection'].value.type !==
        ConnectionTypeEnum.GoogleApi &&
      this.presetForm.controls['preset'].value?.presetId === 'google_analytics'
    ) {
      this.presetForm.controls['preset'].setValue(this.emptyPreset);
    }

    this.cd.detectChanges();
  }

  presetChange() {
    (document.activeElement as HTMLElement).blur();
  }

  create() {
    this.modelNameForm.markAllAsTouched();

    if (!this.modelNameForm.valid || !this.rolesForm.controls['roles'].valid) {
      return;
    }

    if (isUndefined(this.connectionForm.controls['connection'].value)) {
      this.formsError = 'Connection must be selected';
      return;
    }

    if (
      this.modelNameForm.controls['name'].valid &&
      this.rolesForm.controls['roles'].valid
    ) {
      this.ref.close();

      let modelName = this.modelNameForm.controls['name'].value;
      let connection = this.connectionForm.controls['connection'].value;
      let roles = this.rolesForm.controls['roles'].value;

      this.createModel({
        connection: this.connectionForm.controls['connection'].value,
        preset: this.presetForm.controls['preset'].value,
        modelName: modelName,
        roles: roles
      });
    }
  }

  createModel(item: {
    modelName: string;
    roles: string;
    connection: ProjectConnection;
    preset: Preset;
  }) {
    this.spinner.show(APP_SPINNER_NAME);

    let { modelName, connection, preset, roles } = item;

    let filePart = modelName.toLowerCase().split(' ').join('_');

    let fileExt =
      [ConnectionTypeEnum.Api, ConnectionTypeEnum.GoogleApi].indexOf(
        connection.type
      ) > -1
        ? 'store'
        : 'model';

    let fileName = `${filePart}.${fileExt}`;

    let nav = this.navQuery.getValue();

    let struct = this.structQuery.getValue();

    let part = struct.mproveConfig.mproveDirValue;

    part = part.startsWith('.') ? part.slice(1) : part;
    part = part.startsWith('/') ? part.slice(1) : part;
    part = part.endsWith('/') ? part.slice(0, -1) : part;

    let parentNodeId = [struct.projectId, part].join('/');

    let payload: ToBackendCreateFileRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      parentNodeId: parentNodeId,
      fileName: fileName,
      modelInfo: {
        connectionId: connection.connectionId,
        name: modelName,
        accessRoles: roles?.split(',').map(x => x.trim()),
        presetId:
          [ConnectionTypeEnum.Api, ConnectionTypeEnum.GoogleApi].indexOf(
            this.connectionForm.controls['connection'].value.type
          ) > -1
            ? preset.presetId
            : undefined
      }
    };

    this.spinner.show(APP_SPINNER_NAME);

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateFile,
        payload: payload,
        showSpinner: false
      })
      .pipe(
        tap((resp: ToBackendCreateFileResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            if (resp.payload.struct.errors.length > 0) {
              let fId = parentNodeId + '/' + fileName;
              let fIdAr = fId.split('/');
              fIdAr.shift();

              let filePath = fIdAr.join('/');

              let fileId = encodeFilePath({ filePath: filePath });

              this.uiQuery.updatePart({ secondFileNodeId: undefined });

              this.navigateService.navigateToFileLine({
                panel: PanelEnum.Tree,
                encodedFileId: fileId
              });
            } else {
              let modelId =
                [ConnectionTypeEnum.Api, ConnectionTypeEnum.GoogleApi].indexOf(
                  connection.type
                ) > -1
                  ? `store_model_${filePart}`
                  : filePart;

              this.getModelsNavModel({ modelId: modelId });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  getModelsNavModel(item: { modelId: string }) {
    let { modelId } = item;

    let nav = this.navQuery.getValue();

    let payload: ToBackendGetModelsRequestPayload = {
      projectId: nav.projectId,
      isRepoProd: nav.isRepoProd,
      branchId: nav.branchId,
      envId: nav.envId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetModels,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetModelsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });
            this.modelsQuery.update({ models: resp.payload.models });
            //
            this.uiQuery.updatePart({ showSchema: true });

            this.navigateService.navigateToChart({
              modelId: modelId,
              chartId: EMPTY_CHART_ID
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  connectionsSearchFn(term: string, connection: ProjectConnection) {
    let haystack = [`${connection.connectionId}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  presetsSearchFn(term: string, preset: Preset) {
    let haystack = [`${preset.label}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  cancel() {
    this.ref.close();
  }
}
