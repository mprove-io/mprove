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
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { SelectItem } from '~front/app/interfaces/select-item';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { RepoQuery } from '~front/app/queries/repo.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
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

  usersFolder = common.MPROVE_USERS_FOLDER;

  modelNameForm: FormGroup = this.fb.group({
    name: [undefined, [Validators.maxLength(255), Validators.required]]
  });

  modelTypeForm = this.fb.group({
    modelType: [undefined]
  });

  modelTypesList: SelectItem<common.ModelTypeEnum>[] = [
    {
      label: 'SQL',
      value: common.ModelTypeEnum.SQL
    },
    {
      label: 'Store',
      value: common.ModelTypeEnum.Store
    }
  ];

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  connectionForm: FormGroup = this.fb.group({
    connection: [undefined]
  });

  connectionsSpinnerName = 'modelsAddConnectionSpinnerName';

  connections: common.SuggestField[] = [];
  connectionsLoading = false;
  connectionsLoaded = false;

  newModelId = common.makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<CreateModelDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navigateService: NavigateService,
    private repoQuery: RepoQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.modelTypeForm.controls['modelType'].setValue(common.ModelTypeEnum.SQL);

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

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
        take(1)
      )
      .subscribe();

    let payload: apiToBackend.ToBackendGetSuggestFieldsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd,
      envId: nav.envId
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.connectionsSpinnerName);

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetSuggestFields,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetSuggestFieldsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.connections = [...resp.payload.suggestFields];

            this.connectionsLoading = false;
            this.connectionsLoaded = true;

            this.spinner.hide(this.connectionsSpinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();
  }

  modelTypeChange() {
    (document.activeElement as HTMLElement).blur();

    this.connectionForm.controls['connection'].setValue(undefined);

    // this.formsError = undefined;

    // if (
    //   this.modelTypeForm.controls['modelType'].value ===
    //   common.ModelTypeEnum.Store
    // ) {
    //   this.storeModelSet = false;

    //   this.storeModelForm.controls['storeModel'].setValue(undefined);
    //   this.storeFilterForForm.controls['storeFilterFor'].setValue(
    //     common.StoreFilterForEnum.Filter
    //   );
    //   this.storeFilterForm.controls['storeFilter'].setValue(undefined);
    //   this.fieldResultForm.controls['fieldResult'].setValue(undefined);
    //   this.suggestFieldForm.controls['suggestField'].setValue(undefined);

    //   if (this.storeModelsLoaded === false) {
    //     this.loadStoreModels();
    //   }
    // } else {
    //   this.fieldResultForm.controls['fieldResult'].setValue(
    //     common.FieldResultEnum.String
    //   );
    // }
  }

  connectionChange() {
    (document.activeElement as HTMLElement).blur();
  }

  create() {
    this.modelNameForm.markAllAsTouched();

    if (!this.modelNameForm.valid) {
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
        modelName: modelName,
        roles: roles
      });
    }
  }

  createModel(item: { modelName: string; roles: string }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { modelName: modelName, roles } = item;

    let fileName = modelName.toLowerCase().split(' ').join('_');

    fileName = `${fileName}.model`;

    let nav = this.navQuery.getValue();

    let struct = this.structQuery.getValue();

    let part = struct.mproveDirValue;

    part = part.startsWith('.') ? part.slice(1) : part;
    part = part.startsWith('/') ? part.slice(1) : part;
    part = part.endsWith('/') ? part.slice(0, -1) : part;

    let parentNodeId = [struct.projectId, part].join('/');

    let payload: apiToBackend.ToBackendCreateFileRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      parentNodeId: parentNodeId,
      fileName: fileName
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateFile,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateFileResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.repoQuery.update(resp.payload.repo);
            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            let fId = parentNodeId + '/' + fileName;
            let fIdAr = fId.split('/');
            fIdAr.shift();
            let fileId = fIdAr.join(common.TRIPLE_UNDERSCORE);

            this.navigateService.navigateToFileLine({
              panel: common.PanelEnum.Tree,
              underscoreFileId: fileId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  searchFn(term: string, suggestField: common.SuggestField) {
    let haystack = [
      `${suggestField.topLabel} - ${suggestField.partNodeLabel} ${suggestField.partFieldLabel}`
    ];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }

  cancel() {
    this.ref.close();
  }
}
