import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { UiSwitchModule } from 'ngx-ui-switch';
import { take, tap } from 'rxjs/operators';
import { conditionalValidator } from '~front/app/functions/conditional-validator';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { ConnectionsQuery } from '~front/app/queries/connections.query';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

export interface EditConnectionDialogData {
  apiService: ApiService;
  connection: common.Connection;
  i: number;
}

@Component({
  selector: 'm-edit-connection-dialog',
  templateUrl: './edit-connection-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule, UiSwitchModule]
})
export class EditConnectionDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  dataItem: EditConnectionDialogData = this.ref.data;

  editConnectionForm: FormGroup;

  isSSL = true;

  connectionTypes = [
    common.ConnectionTypeEnum.PostgreSQL,
    common.ConnectionTypeEnum.SnowFlake,
    common.ConnectionTypeEnum.ClickHouse,
    common.ConnectionTypeEnum.BigQuery,
    common.ConnectionTypeEnum.GoogleApi,
    common.ConnectionTypeEnum.Api
  ];

  typeSnowFlake = common.ConnectionTypeEnum.SnowFlake;
  typeBigQuery = common.ConnectionTypeEnum.BigQuery;
  typeClickHouse = common.ConnectionTypeEnum.ClickHouse;
  typePostgreSQL = common.ConnectionTypeEnum.PostgreSQL;
  typeGoogleApi = common.ConnectionTypeEnum.GoogleApi;
  typeApi = common.ConnectionTypeEnum.Api;

  constructor(
    public ref: DialogRef<EditConnectionDialogData>,
    private fb: FormBuilder,
    private connectionsQuery: ConnectionsQuery
  ) {}

  ngOnInit() {
    this.isSSL = this.dataItem.connection.isSSL === true ? true : false;

    this.editConnectionForm = this.fb.group({
      connectionId: [this.dataItem.connection.connectionId],
      type: [this.dataItem.connection.type],
      baseUrl: [
        this.dataItem.connection.baseUrl,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.GoogleApi,
                common.ConnectionTypeEnum.Api
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      serviceAccountCredentials: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.BigQuery,
                common.ConnectionTypeEnum.GoogleApi
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      bigqueryQuerySizeLimitGb: [
        this.dataItem.connection.bigqueryQuerySizeLimitGb,
        [
          ValidationService.integerOrEmptyValidator,
          conditionalValidator(
            () =>
              this.editConnectionForm.get('type').value ===
              common.ConnectionTypeEnum.BigQuery,
            Validators.required
          )
        ]
      ],
      account: [
        this.dataItem.connection.account,
        [
          conditionalValidator(
            () =>
              [common.ConnectionTypeEnum.SnowFlake].indexOf(
                this.editConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      warehouse: [
        this.dataItem.connection.warehouse,
        [
          conditionalValidator(
            () =>
              [common.ConnectionTypeEnum.SnowFlake].indexOf(
                this.editConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      host: [
        this.dataItem.connection.host,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      port: [
        this.dataItem.connection.port,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      database: [
        this.dataItem.connection.database,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL
                // ,
                // common.ConnectionTypeEnum.ClickHouse
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      username: [
        this.dataItem.connection.username,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse,
                common.ConnectionTypeEnum.SnowFlake
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      password: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                common.ConnectionTypeEnum.PostgreSQL,
                common.ConnectionTypeEnum.ClickHouse,
                common.ConnectionTypeEnum.SnowFlake
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      scopes: this.fb.array(
        common.isUndefined(this.dataItem.connection.googleAuthScopes)
          ? []
          : this.dataItem.connection.googleAuthScopes.map(scope => {
              let newScope = {
                value: scope
              };
              return this.fb.group(newScope);
            })
      ),
      headers: this.fb.array(
        common.isUndefined(this.dataItem.connection.headers)
          ? []
          : this.dataItem.connection.headers.map(header => {
              let newHeader = {
                key: header.key,
                value: '' // backend returns HEADER_VALUE_IS_HIDDEN
              };
              return this.fb.group(newHeader);
            })
      )
    });

    this.editConnectionForm.get('type').valueChanges.subscribe(value => {
      this.editConnectionForm.get('baseUrl').updateValueAndValidity();
      this.editConnectionForm
        .get('serviceAccountCredentials')
        .updateValueAndValidity();
      this.editConnectionForm
        .get('bigqueryQuerySizeLimitGb')
        .updateValueAndValidity();
      this.editConnectionForm.get('account').updateValueAndValidity();
      this.editConnectionForm.get('warehouse').updateValueAndValidity();
      this.editConnectionForm.get('host').updateValueAndValidity();
      this.editConnectionForm.get('port').updateValueAndValidity();
      this.editConnectionForm.get('database').updateValueAndValidity();
      this.editConnectionForm.get('username').updateValueAndValidity();
      this.editConnectionForm.get('password').updateValueAndValidity();
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  getHeaders(): FormArray {
    return this.editConnectionForm.controls['headers'] as FormArray;
  }

  getScopes(): FormArray {
    return this.editConnectionForm.controls['scopes'] as FormArray;
  }

  addHeader() {
    let headerGroup = this.fb.group({
      key: [''],
      value: ['']
    });
    this.getHeaders().push(headerGroup);
  }

  addScope() {
    let scopeGroup = this.fb.group({
      value: ['']
    });
    this.getScopes().push(scopeGroup);
  }

  removeHeader(index: number) {
    this.getHeaders().removeAt(index);
  }

  removeScope(index: number) {
    this.getScopes().removeAt(index);
  }

  showLog() {
    console.log(this.editConnectionForm.get('headers').value);
    console.log(this.editConnectionForm.get('scopes').value);
  }

  toggleSSL() {
    this.isSSL = !this.isSSL;
  }

  save() {
    this.editConnectionForm.markAllAsTouched();

    if (!this.editConnectionForm.valid) {
      return;
    }

    this.ref.close();

    let payload: apiToBackend.ToBackendEditConnectionRequestPayload = {
      projectId: this.dataItem.connection.projectId,
      envId: this.dataItem.connection.envId,
      connectionId: this.editConnectionForm.value.connectionId,
      baseUrl: this.editConnectionForm.value.baseUrl,
      serviceAccountCredentials: common.isDefined(
        this.editConnectionForm.value.serviceAccountCredentials
      )
        ? JSON.parse(this.editConnectionForm.value.serviceAccountCredentials)
        : undefined,
      headers: this.editConnectionForm.value.headers,
      googleAuthScopes:
        [common.ConnectionTypeEnum.GoogleApi].indexOf(
          this.editConnectionForm.get('type').value
        ) > -1
          ? this.editConnectionForm.value.scopes.map((x: any) => x.value)
          : [],
      bigqueryQuerySizeLimitGb: common.isDefined(
        this.editConnectionForm.value.bigqueryQuerySizeLimitGb
      )
        ? Number(this.editConnectionForm.value.bigqueryQuerySizeLimitGb)
        : undefined,
      account: this.editConnectionForm.value.account,
      warehouse: this.editConnectionForm.value.warehouse,
      host: this.editConnectionForm.value.host,
      port: common.isDefined(this.editConnectionForm.value.port)
        ? Number(this.editConnectionForm.value.port)
        : undefined,
      database: this.editConnectionForm.value.database,
      username: this.editConnectionForm.value.username,
      password: this.editConnectionForm.value.password,
      isSSL: this.isSSL
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditConnection,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditConnectionResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let connectionsState = this.connectionsQuery.getValue();

            connectionsState.connections[this.dataItem.i] =
              resp.payload.connection;

            this.connectionsQuery.update({
              connections: [...connectionsState.connections],
              total: connectionsState.total
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}
