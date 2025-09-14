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
import { conditionalValidator } from '~front/app/functions/conditional-validator';
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
  editConnectionForm: FormGroup;

  editBigqueryForm: FormGroup;
  editClickhouseForm: FormGroup;
  editMotherduckForm: FormGroup;
  editPostgresForm: FormGroup;
  editSnowflakeForm: FormGroup;
  editApiForm: FormGroup;
  editGoogleApiForm: FormGroup;

  isSSL = true;
  isClickhouseSSL = true;

  isMotherduckAttachModeSingle = true;
  isMotherduckAccessModeReadOnly = true;

  // connectionId: string;
  // connectionType: ConnectionTypeEnum;

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
    // this.isSSL = this.dataItem.connection.isSSL === true ? true : false;

    this.editForm = this.fb.group({
      connectionId: [this.dataItem.connection.connectionId],
      type: [this.dataItem.connection.type]
    });

    this.editBigqueryForm = this.fb.group({
      serviceAccountCredentials: [undefined, [Validators.required]],
      bigqueryQuerySizeLimitGb: [
        this.dataItem.connection.bigqueryOptions?.bigqueryQuerySizeLimitGb,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ]
    });

    this.editClickhouseForm = this.fb.group({
      host: [
        this.dataItem.connection.clickhouseOptions.host,
        [Validators.required]
      ],
      port: [
        this.dataItem.connection.clickhouseOptions.port,
        [Validators.required]
      ],
      username: [
        this.dataItem.connection.clickhouseOptions.username,
        [Validators.required]
      ],
      password: [undefined, [Validators.required]]
    });

    this.editMotherduckForm = this.fb.group({
      motherduckToken: [undefined, [Validators.required]],
      database: [
        this.dataItem.connection.motherduckOptions.database,
        [Validators.required]
      ]
    });

    //
    //
    //

    this.editConnectionForm = this.fb.group({
      connectionId: [this.dataItem.connection.connectionId],
      type: [this.dataItem.connection.type],
      baseUrl: [
        this.dataItem.connection.baseUrl,
        [
          conditionalValidator(
            () =>
              [ConnectionTypeEnum.GoogleApi, ConnectionTypeEnum.Api].indexOf(
                this.editConnectionForm.get('type').value
              ) > -1,
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
                ConnectionTypeEnum.BigQuery,
                ConnectionTypeEnum.GoogleApi
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
              ConnectionTypeEnum.BigQuery,
            Validators.required
          )
        ]
      ],
      account: [
        this.dataItem.connection.account,
        [
          conditionalValidator(
            () =>
              [ConnectionTypeEnum.SnowFlake].indexOf(
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
              [ConnectionTypeEnum.SnowFlake].indexOf(
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
                ConnectionTypeEnum.PostgreSQL,
                ConnectionTypeEnum.ClickHouse
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
                ConnectionTypeEnum.PostgreSQL,
                ConnectionTypeEnum.ClickHouse
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
                ConnectionTypeEnum.PostgreSQL
                // ,
                // ConnectionTypeEnum.ClickHouse
                // ,
                // ConnectionTypeEnum.SnowFlake
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
                ConnectionTypeEnum.PostgreSQL,
                ConnectionTypeEnum.ClickHouse,
                ConnectionTypeEnum.SnowFlake
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
                ConnectionTypeEnum.PostgreSQL,
                ConnectionTypeEnum.ClickHouse,
                ConnectionTypeEnum.SnowFlake
              ].indexOf(this.editConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      motherduckToken: [
        undefined,
        [
          conditionalValidator(
            () =>
              [ConnectionTypeEnum.MotherDuck].indexOf(
                this.editConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      scopes: this.fb.array(
        isUndefined(this.dataItem.connection.googleAuthScopes)
          ? []
          : this.dataItem.connection.googleAuthScopes.map(scope => {
              let newScope = {
                value: scope
              };
              return this.fb.group(newScope);
            })
      ),
      headers: this.fb.array(
        isUndefined(this.dataItem.connection.headers)
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
      this.editConnectionForm.get('motherduckToken').updateValueAndValidity();
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

    let cType = this.editConnectionForm.value.type;

    let saCredentials = isDefined(
      this.editConnectionForm.value.serviceAccountCredentials
    )
      ? JSON.parse(this.editConnectionForm.value.serviceAccountCredentials)
      : undefined;

    let payload: ToBackendEditConnectionRequestPayload = {
      projectId: this.dataItem.connection.projectId,
      envId: this.dataItem.connection.envId,
      connectionId: this.editConnectionForm.value.connectionId,

      bigqueryOptions:
        cType === ConnectionTypeEnum.BigQuery
          ? {
              googleCloudProject: undefined,
              googleCloudClientEmail: undefined,
              serviceAccountCredentials: saCredentials,
              bigqueryQuerySizeLimitGb: isDefined(
                this.editConnectionForm.value.bigqueryQuerySizeLimitGb
              )
                ? Number(this.editConnectionForm.value.bigqueryQuerySizeLimitGb)
                : undefined
            }
          : undefined,
      clickhouseOptions:
        cType === ConnectionTypeEnum.ClickHouse
          ? {
              host: this.editConnectionForm.value.host,
              port: isDefined(this.editConnectionForm.value.port)
                ? Number(this.editConnectionForm.value.port)
                : undefined,
              username: this.editConnectionForm.value.username,
              password: this.editConnectionForm.value.password,
              isSSL: this.isSSL
            }
          : undefined,
      motherduckOptions:
        cType === ConnectionTypeEnum.MotherDuck
          ? {
              motherduckToken: this.editConnectionForm.value.motherduckToken,
              database: this.editConnectionForm.value.database,
              attachModeSingle: true, // TODO: attachModeSingle
              accessModeReadOnly: true // TODO: accessModeReadOnly
            }
          : undefined,
      postgresOptions:
        cType === ConnectionTypeEnum.PostgreSQL
          ? {
              host: this.editConnectionForm.value.host,
              port: isDefined(this.editConnectionForm.value.port)
                ? Number(this.editConnectionForm.value.port)
                : undefined,
              database: this.editConnectionForm.value.database,
              username: this.editConnectionForm.value.username,
              password: this.editConnectionForm.value.password,
              isSSL: this.isSSL
            }
          : undefined,
      snowflakeOptions:
        cType === ConnectionTypeEnum.SnowFlake
          ? {
              account: this.editConnectionForm.value.account,
              warehouse: this.editConnectionForm.value.warehouse,
              database: this.editConnectionForm.value.database,
              username: this.editConnectionForm.value.username,
              password: this.editConnectionForm.value.password
            }
          : undefined,
      storeApiOptions:
        cType === ConnectionTypeEnum.Api
          ? {
              baseUrl: this.editConnectionForm.value.baseUrl,
              headers: this.editConnectionForm.value.headers
            }
          : undefined,
      storeGoogleApiOptions:
        cType === ConnectionTypeEnum.GoogleApi
          ? {
              googleAccessToken: undefined,
              googleCloudProject: undefined,
              googleCloudClientEmail: undefined,
              serviceAccountCredentials: saCredentials,
              baseUrl: this.editConnectionForm.value.baseUrl,
              headers: this.editConnectionForm.value.headers,
              googleAuthScopes:
                [ConnectionTypeEnum.GoogleApi].indexOf(
                  this.editConnectionForm.get('type').value
                ) > -1
                  ? this.editConnectionForm.value.scopes.map(
                      (x: any) => x.value
                    )
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
