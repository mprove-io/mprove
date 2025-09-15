import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
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
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import {
  ToBackendEditConnectionRequestPayload,
  ToBackendEditConnectionResponse
} from '~common/interfaces/to-backend/connections/to-backend-edit-connection';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { ConnectionsQuery } from '~front/app/queries/connections.query';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';

export interface EditConnectionDialogData {
  apiService: ApiService;
  connection: ProjectConnection;
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

  editForm: FormGroup;

  editBigqueryForm: FormGroup;
  editClickhouseForm: FormGroup;
  editMotherduckForm: FormGroup;
  editPostgresForm: FormGroup;
  editSnowflakeForm: FormGroup;
  editApiForm: FormGroup;
  editGoogleApiForm: FormGroup;

  isClickhouseSSL = true;
  isPostgresSSL = true;

  isMotherduckAttachModeSingle = true;
  isMotherduckAccessModeReadOnly = true;

  connectionTypes = [
    ConnectionTypeEnum.PostgreSQL,
    ConnectionTypeEnum.SnowFlake,
    ConnectionTypeEnum.ClickHouse, // TODO: hide clickhouse
    ConnectionTypeEnum.BigQuery,
    ConnectionTypeEnum.GoogleApi,
    ConnectionTypeEnum.Api
  ];

  typeSnowFlake = ConnectionTypeEnum.SnowFlake;
  typeBigQuery = ConnectionTypeEnum.BigQuery;
  typeClickHouse = ConnectionTypeEnum.ClickHouse;
  typeMotherDuck = ConnectionTypeEnum.MotherDuck;
  typePostgreSQL = ConnectionTypeEnum.PostgreSQL;
  typeGoogleApi = ConnectionTypeEnum.GoogleApi;
  typeApi = ConnectionTypeEnum.Api;

  constructor(
    public ref: DialogRef<EditConnectionDialogData>,
    private fb: FormBuilder,
    private connectionsQuery: ConnectionsQuery
  ) {}

  ngOnInit() {
    this.isClickhouseSSL =
      this.dataItem.connection.clickhouseOptions?.isSSL === true ? true : false;

    this.isPostgresSSL =
      this.dataItem.connection.postgresOptions?.isSSL === true ? true : false;

    this.isMotherduckAttachModeSingle =
      this.dataItem.connection.motherduckOptions?.attachModeSingle === true
        ? true
        : false;

    this.isMotherduckAccessModeReadOnly =
      this.dataItem.connection.motherduckOptions?.accessModeReadOnly === true
        ? true
        : false;

    this.editForm = this.fb.group({
      connectionId: [this.dataItem.connection.connectionId],
      type: [this.dataItem.connection.type]
    });

    this.editBigqueryForm = this.fb.group({
      serviceAccountCredentials: [
        this.dataItem.connection.bigqueryOptions?.serviceAccountCredentials,
        [Validators.required]
      ],
      bigqueryQuerySizeLimitGb: [
        this.dataItem.connection.bigqueryOptions?.bigqueryQuerySizeLimitGb,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ]
    });

    this.editClickhouseForm = this.fb.group({
      host: [
        this.dataItem.connection.clickhouseOptions?.host,
        [Validators.required]
      ],
      port: [
        this.dataItem.connection.clickhouseOptions?.port,
        [Validators.required]
      ],
      username: [
        this.dataItem.connection.clickhouseOptions?.username,
        [Validators.required]
      ],
      password: [
        this.dataItem.connection.clickhouseOptions?.password,
        [Validators.required]
      ]
    });

    this.editMotherduckForm = this.fb.group({
      motherduckToken: [
        this.dataItem.connection.motherduckOptions?.motherduckToken,
        [Validators.required]
      ],
      database: [
        this.dataItem.connection.motherduckOptions?.database,
        [Validators.required, ValidationService.motherduckDatabaseWrongChars]
      ]
    });

    this.editPostgresForm = this.fb.group({
      host: [
        this.dataItem.connection.postgresOptions?.host,
        [Validators.required]
      ],
      port: [
        this.dataItem.connection.postgresOptions?.port,
        [Validators.required]
      ],
      database: [
        this.dataItem.connection.postgresOptions?.database,
        [Validators.required]
      ],
      username: [
        this.dataItem.connection.postgresOptions?.username,
        [Validators.required]
      ],
      password: [
        this.dataItem.connection.postgresOptions?.password,
        [Validators.required]
      ]
    });

    this.editSnowflakeForm = this.fb.group({
      account: [
        this.dataItem.connection.snowflakeOptions?.account,
        [Validators.required]
      ],
      warehouse: [
        this.dataItem.connection.snowflakeOptions?.warehouse,
        [Validators.required]
      ],
      database: [
        this.dataItem.connection.snowflakeOptions?.database,
        [Validators.required]
      ],
      username: [
        this.dataItem.connection.snowflakeOptions?.username,
        [Validators.required]
      ],
      password: [
        this.dataItem.connection.snowflakeOptions?.password,
        [Validators.required]
      ]
    });

    this.editApiForm = this.fb.group({
      baseUrl: [
        this.dataItem.connection.storeApiOptions?.baseUrl,
        [Validators.required]
      ],
      headers: this.fb.array(
        isUndefined(this.dataItem.connection.storeApiOptions?.headers)
          ? []
          : this.dataItem.connection.storeApiOptions?.headers.map(header => {
              let newHeader = {
                key: header.key,
                value: header.value ?? ''
              };
              return this.fb.group(newHeader);
            })
      )
    });

    this.editGoogleApiForm = this.fb.group({
      serviceAccountCredentials: [
        this.dataItem.connection.storeGoogleApiOptions
          ?.serviceAccountCredentials,
        [Validators.required]
      ],
      baseUrl: [
        this.dataItem.connection.storeGoogleApiOptions?.baseUrl,
        [Validators.required]
      ],
      headers: this.fb.array(
        isUndefined(this.dataItem.connection.storeGoogleApiOptions?.headers)
          ? []
          : this.dataItem.connection.storeGoogleApiOptions?.headers.map(
              header => {
                let newHeader = {
                  key: header.key,
                  value: header.value ?? ''
                };
                return this.fb.group(newHeader);
              }
            )
      ),
      scopes: this.fb.array(
        isUndefined(
          this.dataItem.connection.storeGoogleApiOptions?.googleAuthScopes
        )
          ? []
          : this.dataItem.connection.storeGoogleApiOptions?.googleAuthScopes.map(
              scope => {
                let newScope = {
                  value: scope
                };
                return this.fb.group(newScope);
              }
            )
      )
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  // scopes

  getScopes(): FormArray {
    return this.editGoogleApiForm.controls['scopes'] as FormArray;
  }

  addScope() {
    let scopeGroup = this.fb.group({
      value: ['']
    });
    this.getScopes().push(scopeGroup);
  }

  removeScope(index: number) {
    this.getScopes().removeAt(index);
  }

  // googleApi

  googleApiGetHeaders(): FormArray {
    return this.editGoogleApiForm.controls['headers'] as FormArray;
  }

  googleApiAddHeader() {
    let headerGroup = this.fb.group({
      key: [''],
      value: ['']
    });
    this.googleApiGetHeaders().push(headerGroup);
  }

  googleApiRemoveHeader(index: number) {
    this.googleApiGetHeaders().removeAt(index);
  }

  // api

  apiGetHeaders(): FormArray {
    return this.editApiForm.controls['headers'] as FormArray;
  }

  apiAddHeader() {
    let headerGroup = this.fb.group({
      key: [''],
      value: ['']
    });
    this.apiGetHeaders().push(headerGroup);
  }

  apiRemoveHeader(index: number) {
    this.apiGetHeaders().removeAt(index);
  }

  // showLog() {
  //   console.log(this.editConnectionForm.get('headers').value);
  //   console.log(this.editConnectionForm.get('scopes').value);
  // }

  // toggleSSL() {
  //   this.isSSL = !this.isSSL;
  // }

  toggleClickhouseSSL() {
    this.isClickhouseSSL = !this.isClickhouseSSL;
  }

  togglePostgresSSL() {
    this.isPostgresSSL = !this.isPostgresSSL;
  }

  toggleMotherduckAttachModeSingle() {
    this.isMotherduckAttachModeSingle = !this.isMotherduckAttachModeSingle;
  }

  toggleMotherduckAccessModeReadOnly() {
    this.isMotherduckAccessModeReadOnly = !this.isMotherduckAccessModeReadOnly;
  }

  save() {
    this.editForm.markAllAsTouched();

    this.editBigqueryForm.markAllAsTouched();
    this.editClickhouseForm.markAllAsTouched();
    this.editMotherduckForm.markAllAsTouched();
    this.editPostgresForm.markAllAsTouched();
    this.editSnowflakeForm.markAllAsTouched();
    this.editApiForm.markAllAsTouched();
    this.editGoogleApiForm.markAllAsTouched();

    let cType: ConnectionTypeEnum = this.editForm.value.type;

    if (
      (cType === ConnectionTypeEnum.BigQuery && !this.editBigqueryForm.valid) ||
      (cType === ConnectionTypeEnum.ClickHouse &&
        !this.editClickhouseForm.valid) ||
      (cType === ConnectionTypeEnum.MotherDuck &&
        !this.editMotherduckForm.valid) ||
      (cType === ConnectionTypeEnum.PostgreSQL &&
        !this.editPostgresForm.valid) ||
      (cType === ConnectionTypeEnum.SnowFlake &&
        !this.editSnowflakeForm.valid) ||
      (cType === ConnectionTypeEnum.Api && !this.editApiForm.valid) ||
      (cType === ConnectionTypeEnum.GoogleApi && !this.editGoogleApiForm.valid)
    ) {
      return;
    }

    this.ref.close();

    let bigqueryCredentials = isDefined(
      this.editBigqueryForm.value.serviceAccountCredentials
    )
      ? JSON.parse(this.editBigqueryForm.value.serviceAccountCredentials)
      : undefined;

    let googleApiCredentials = isDefined(
      this.editGoogleApiForm.value.serviceAccountCredentials
    )
      ? JSON.parse(this.editGoogleApiForm.value.serviceAccountCredentials)
      : undefined;

    let payload: ToBackendEditConnectionRequestPayload = {
      projectId: this.dataItem.connection.projectId,
      envId: this.dataItem.connection.envId,
      connectionId: this.editForm.value.connectionId,
      bigqueryOptions:
        cType === ConnectionTypeEnum.BigQuery
          ? {
              googleCloudProject: undefined,
              googleCloudClientEmail: undefined,
              serviceAccountCredentials: bigqueryCredentials,
              bigqueryQuerySizeLimitGb: isDefined(
                this.editBigqueryForm.value.bigqueryQuerySizeLimitGb
              )
                ? Number(this.editBigqueryForm.value.bigqueryQuerySizeLimitGb)
                : undefined
            }
          : undefined,
      clickhouseOptions:
        cType === ConnectionTypeEnum.ClickHouse
          ? {
              host: this.editClickhouseForm.value.host,
              port: isDefined(this.editClickhouseForm.value.port)
                ? Number(this.editClickhouseForm.value.port)
                : undefined,
              username: this.editClickhouseForm.value.username,
              password: this.editClickhouseForm.value.password,
              isSSL: this.isClickhouseSSL
            }
          : undefined,
      motherduckOptions:
        cType === ConnectionTypeEnum.MotherDuck
          ? {
              motherduckToken: this.editMotherduckForm.value.motherduckToken,
              database: this.editMotherduckForm.value.database,
              attachModeSingle: this.isMotherduckAttachModeSingle,
              accessModeReadOnly: this.isMotherduckAccessModeReadOnly
            }
          : undefined,
      postgresOptions:
        cType === ConnectionTypeEnum.PostgreSQL
          ? {
              host: this.editPostgresForm.value.host,
              port: isDefined(this.editPostgresForm.value.port)
                ? Number(this.editPostgresForm.value.port)
                : undefined,
              database: this.editPostgresForm.value.database,
              username: this.editPostgresForm.value.username,
              password: this.editPostgresForm.value.password,
              isSSL: this.isPostgresSSL
            }
          : undefined,
      snowflakeOptions:
        cType === ConnectionTypeEnum.SnowFlake
          ? {
              account: this.editSnowflakeForm.value.account,
              warehouse: this.editSnowflakeForm.value.warehouse,
              database: this.editSnowflakeForm.value.database,
              username: this.editSnowflakeForm.value.username,
              password: this.editSnowflakeForm.value.password
            }
          : undefined,
      storeApiOptions:
        cType === ConnectionTypeEnum.Api
          ? {
              baseUrl: this.editApiForm.value.baseUrl,
              headers: this.editApiForm.value.headers
            }
          : undefined,
      storeGoogleApiOptions:
        cType === ConnectionTypeEnum.GoogleApi
          ? {
              googleAccessToken: undefined,
              googleCloudProject: undefined,
              googleCloudClientEmail: undefined,
              serviceAccountCredentials: googleApiCredentials,
              baseUrl: this.editGoogleApiForm.value.baseUrl,
              headers: this.editGoogleApiForm.value.headers,
              googleAuthScopes:
                [ConnectionTypeEnum.GoogleApi].indexOf(
                  this.editGoogleApiForm.get('type').value
                ) > -1
                  ? this.editGoogleApiForm.value.scopes.map((x: any) => x.value)
                  : []
            }
          : undefined
    };

    let apiService: ApiService = this.dataItem.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditConnection,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditConnectionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let newConnection = resp.payload.connection;

            let connections = this.connectionsQuery.getValue().connections;

            let newSortedConnections = [
              newConnection,
              ...connections.filter(
                x =>
                  x.projectId !== newConnection.projectId ||
                  x.connectionId !== newConnection.connectionId ||
                  x.envId !== newConnection.envId
              )
            ].sort((a, b) =>
              a.connectionId > b.connectionId
                ? 1
                : b.connectionId > a.connectionId
                  ? -1
                  : 0
            );

            this.connectionsQuery.update({
              connections: newSortedConnections
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
