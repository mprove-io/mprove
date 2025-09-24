import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { UiSwitchModule } from 'ngx-ui-switch';
import { map, take, tap } from 'rxjs/operators';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { EnvsItem } from '~common/interfaces/backend/envs-item';
import {
  ToBackendCreateConnectionRequestPayload,
  ToBackendCreateConnectionResponse
} from '~common/interfaces/to-backend/connections/to-backend-create-connection';
import {
  ToBackendGetEnvsListRequestPayload,
  ToBackendGetEnvsListResponse
} from '~common/interfaces/to-backend/envs/to-backend-get-envs-list';
import { SharedModule } from '~front/app/modules/shared/shared.module';
import { ConnectionsQuery } from '~front/app/queries/connections.query';
import { ApiService } from '~front/app/services/api.service';
import { ValidationService } from '~front/app/services/validation.service';

export interface AddConnectionDialogData {
  apiService: ApiService;
  projectId: string;
}

@Component({
  selector: 'm-add-connection-dialog',
  templateUrl: './add-connection-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    UiSwitchModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule
  ]
})
export class AddConnectionDialogComponent implements OnInit {
  @ViewChild('addConnectionDialogEnvSelect', { static: false })
  addConnectionDialogEnvSelectElement: NgSelectComponent;

  @ViewChild('addConnectionDialogTypeSelect', { static: false })
  addConnectionDialogTypeSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.addConnectionDialogEnvSelectElement?.close();
    this.addConnectionDialogTypeSelectElement?.close();
    // this.ref.close();
  }

  addForm: FormGroup;

  addBigqueryForm: FormGroup;
  addClickhouseForm: FormGroup;
  addMotherduckForm: FormGroup;
  addPostgresForm: FormGroup;
  addMysqlForm: FormGroup;
  addTrinoForm: FormGroup;
  addPrestoForm: FormGroup;
  addSnowflakeForm: FormGroup;
  addApiForm: FormGroup;
  addGoogleApiForm: FormGroup;

  envsList: EnvsItem[] = [];
  envsListLoading = false;
  envsListLength = 0;

  isClickhouseSSL = true;
  isPostgresSSL = true;
  isMotherduckAttachModeSingle = true;
  isMotherduckAccessModeReadOnly = true;

  connectionTypes = [
    ConnectionTypeEnum.PostgreSQL,
    ConnectionTypeEnum.MySQL,
    ConnectionTypeEnum.Trino,
    ConnectionTypeEnum.Presto,
    // ConnectionTypeEnum.ClickHouse,
    ConnectionTypeEnum.SnowFlake,
    ConnectionTypeEnum.BigQuery,
    ConnectionTypeEnum.MotherDuck,
    ConnectionTypeEnum.GoogleApi,
    ConnectionTypeEnum.Api
  ];

  typePostgreSQL = ConnectionTypeEnum.PostgreSQL;
  typeMySQL = ConnectionTypeEnum.MySQL;
  typeTrino = ConnectionTypeEnum.Trino;
  typePresto = ConnectionTypeEnum.Presto;
  typeSnowFlake = ConnectionTypeEnum.SnowFlake;
  typeClickHouse = ConnectionTypeEnum.ClickHouse;
  typeMotherDuck = ConnectionTypeEnum.MotherDuck;
  typeBigQuery = ConnectionTypeEnum.BigQuery;
  typeGoogleApi = ConnectionTypeEnum.GoogleApi;
  typeApi = ConnectionTypeEnum.Api;

  constructor(
    public ref: DialogRef<AddConnectionDialogData>,
    private fb: FormBuilder,
    private connectionsQuery: ConnectionsQuery
  ) {}

  ngOnInit() {
    this.addForm = this.fb.group({
      connectionId: [
        undefined,
        [
          Validators.required,
          ValidationService.connectionNameWrongChars,
          Validators.maxLength(255)
        ]
      ],
      envId: [PROJECT_ENV_PROD],
      type: [ConnectionTypeEnum.PostgreSQL]
    });

    this.addBigqueryForm = this.fb.group({
      serviceAccountCredentials: [undefined, [Validators.required]],
      bigqueryQuerySizeLimitGb: [
        1,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ]
    });

    this.addClickhouseForm = this.fb.group({
      host: [undefined, [Validators.required]],
      port: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ],
      username: [undefined, [Validators.required]],
      password: [undefined, [Validators.required]]
    });

    this.addMotherduckForm = this.fb.group({
      motherduckToken: [undefined, [Validators.required]],
      database: [undefined, [ValidationService.motherduckDatabaseWrongChars]]
    });

    this.addPostgresForm = this.fb.group({
      host: [undefined, [Validators.required]],
      port: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ],
      database: [undefined, [Validators.required]],
      username: [undefined, [Validators.required]],
      password: [undefined, [Validators.required]]
    });

    this.addMysqlForm = this.fb.group({
      host: [undefined, [Validators.required]],
      port: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ],
      database: [undefined, [Validators.required]],
      user: [undefined, [Validators.required]],
      password: [undefined, [Validators.required]]
    });

    this.addTrinoForm = this.fb.group({
      server: [undefined, [Validators.required]],
      catalog: [undefined, []],
      schema: [undefined, []],
      user: [undefined, [Validators.required]],
      password: [undefined, []]
    });

    this.addPrestoForm = this.fb.group({
      server: [undefined, [Validators.required]],
      port: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ],
      catalog: [undefined, []],
      schema: [undefined, []],
      user: [undefined, [Validators.required]],
      password: [undefined, []]
    });

    this.addSnowflakeForm = this.fb.group({
      account: [undefined, [Validators.required]],
      warehouse: [undefined, [Validators.required]],
      database: [undefined, []],
      username: [undefined, [Validators.required]],
      password: [undefined, [Validators.required]]
    });

    this.addApiForm = this.fb.group({
      baseUrl: [undefined, [Validators.required]],
      headers: this.fb.array([])
      // headers: this.fb.array([
      //   this.fb.group({ key: 'a1', value: 'v1' }),
      //   this.fb.group({ key: 'a2', value: 'v2' })
      // ])
    });

    this.addGoogleApiForm = this.fb.group({
      serviceAccountCredentials: [undefined, [Validators.required]],
      baseUrl: ['https://analyticsdata.googleapis.com', [Validators.required]],
      headers: this.fb.array([]),
      // headers: this.fb.array([
      //   this.fb.group({ key: 'a1', value: 'v1' }),
      //   this.fb.group({ key: 'a2', value: 'v2' })
      // ])
      scopes: this.fb.array([
        this.fb.group({
          value: 'https://www.googleapis.com/auth/analytics.readonly'
        })
      ])
    });

    this.addForm.get('type').valueChanges.subscribe(value => {
      this.addBigqueryForm
        .get('serviceAccountCredentials')
        .updateValueAndValidity();
      this.addBigqueryForm
        .get('bigqueryQuerySizeLimitGb')
        .updateValueAndValidity();

      this.addClickhouseForm.get('host').updateValueAndValidity();
      this.addClickhouseForm.get('port').updateValueAndValidity();
      this.addClickhouseForm.get('username').updateValueAndValidity();
      this.addClickhouseForm.get('password').updateValueAndValidity();

      this.addMotherduckForm.get('motherduckToken').updateValueAndValidity();
      this.addMotherduckForm.get('database').updateValueAndValidity();

      this.addPostgresForm.get('host').updateValueAndValidity();
      this.addPostgresForm.get('port').updateValueAndValidity();
      this.addPostgresForm.get('database').updateValueAndValidity();
      this.addPostgresForm.get('username').updateValueAndValidity();
      this.addPostgresForm.get('password').updateValueAndValidity();

      this.addMysqlForm.get('host').updateValueAndValidity();
      this.addMysqlForm.get('port').updateValueAndValidity();
      this.addMysqlForm.get('database').updateValueAndValidity();
      this.addMysqlForm.get('user').updateValueAndValidity();
      this.addMysqlForm.get('password').updateValueAndValidity();

      this.addTrinoForm.get('server').updateValueAndValidity();
      this.addTrinoForm.get('catalog').updateValueAndValidity();
      this.addTrinoForm.get('schema').updateValueAndValidity();
      this.addTrinoForm.get('user').updateValueAndValidity();
      this.addTrinoForm.get('password').updateValueAndValidity();

      this.addPrestoForm.get('server').updateValueAndValidity();
      this.addPrestoForm.get('port').updateValueAndValidity();
      this.addPrestoForm.get('catalog').updateValueAndValidity();
      this.addPrestoForm.get('schema').updateValueAndValidity();
      this.addPrestoForm.get('user').updateValueAndValidity();
      this.addPrestoForm.get('password').updateValueAndValidity();

      this.addSnowflakeForm.get('account').updateValueAndValidity();
      this.addSnowflakeForm.get('warehouse').updateValueAndValidity();
      this.addSnowflakeForm.get('database').updateValueAndValidity();
      this.addSnowflakeForm.get('username').updateValueAndValidity();
      this.addSnowflakeForm.get('password').updateValueAndValidity();

      this.addApiForm.get('baseUrl').updateValueAndValidity();
      this.addApiForm.get('headers').updateValueAndValidity();

      this.addGoogleApiForm
        .get('serviceAccountCredentials')
        .updateValueAndValidity();
      this.addGoogleApiForm.get('baseUrl').updateValueAndValidity();
      this.addGoogleApiForm.get('headers').updateValueAndValidity();
      this.addGoogleApiForm.get('scopes').updateValueAndValidity();
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  // scopes

  getScopes(): FormArray {
    return this.addGoogleApiForm.controls['scopes'] as FormArray;
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
    return this.addGoogleApiForm.controls['headers'] as FormArray;
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
    return this.addApiForm.controls['headers'] as FormArray;
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
  //   console.log(this.addConnectionForm.get('headers').value);
  //   console.log(this.addConnectionForm.get('scopes').value);
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

  openEnvSelect() {
    this.envsListLoading = true;

    let payload: ToBackendGetEnvsListRequestPayload = {
      projectId: this.ref.data.projectId,
      isFilter: false
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetEnvsList,
        payload: payload
      })
      .pipe(
        map((resp: ToBackendGetEnvsListResponse) => resp.payload.envsList),
        tap(x => {
          this.envsList = x;
          this.envsListLoading = false;
          this.envsListLength = x.length;
        }),
        take(1)
      )
      .subscribe();
  }

  changeType(type: ConnectionTypeEnum) {
    if (type !== ConnectionTypeEnum.BigQuery) {
      this.addBigqueryForm.controls['serviceAccountCredentials'].reset();
      this.addBigqueryForm.controls['bigqueryQuerySizeLimitGb'].reset();
    }

    if (type !== ConnectionTypeEnum.ClickHouse) {
      this.addClickhouseForm.controls['host'].reset();
      this.addClickhouseForm.controls['port'].reset();
      this.addClickhouseForm.controls['username'].reset();
      this.addClickhouseForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.MotherDuck) {
      this.addMotherduckForm.controls['motherduckToken'].reset();
      this.addMotherduckForm.controls['database'].reset();
    }

    if (type !== ConnectionTypeEnum.PostgreSQL) {
      this.addPostgresForm.controls['host'].reset();
      this.addPostgresForm.controls['port'].reset();
      this.addPostgresForm.controls['database'].reset();
      this.addPostgresForm.controls['username'].reset();
      this.addPostgresForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.MySQL) {
      this.addMysqlForm.controls['host'].reset();
      this.addMysqlForm.controls['port'].reset();
      this.addMysqlForm.controls['database'].reset();
      this.addMysqlForm.controls['user'].reset();
      this.addMysqlForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.Trino) {
      this.addTrinoForm.controls['server'].reset();
      this.addTrinoForm.controls['catalog'].reset();
      this.addTrinoForm.controls['schema'].reset();
      this.addTrinoForm.controls['user'].reset();
      this.addTrinoForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.Presto) {
      this.addPrestoForm.controls['server'].reset();
      this.addPrestoForm.controls['port'].reset();
      this.addPrestoForm.controls['catalog'].reset();
      this.addPrestoForm.controls['schema'].reset();
      this.addPrestoForm.controls['user'].reset();
      this.addPrestoForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.SnowFlake) {
      this.addSnowflakeForm.controls['account'].reset();
      this.addSnowflakeForm.controls['warehouse'].reset();
      this.addSnowflakeForm.controls['database'].reset();
      this.addSnowflakeForm.controls['username'].reset();
      this.addSnowflakeForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.Api) {
      this.addApiForm.controls['baseUrl'].reset();
      this.addApiForm.controls['headers'].reset();
    }

    if (type !== ConnectionTypeEnum.GoogleApi) {
      this.addGoogleApiForm.controls['serviceAccountCredentials'].reset();
      this.addGoogleApiForm.controls['baseUrl'].reset();
      this.addGoogleApiForm.controls['headers'].reset();
      this.addGoogleApiForm.controls['scopes'].reset();
    }
  }

  add() {
    this.addForm.markAllAsTouched();

    this.addBigqueryForm.markAllAsTouched();
    this.addClickhouseForm.markAllAsTouched();
    this.addMotherduckForm.markAllAsTouched();
    this.addPostgresForm.markAllAsTouched();
    this.addMysqlForm.markAllAsTouched();
    this.addTrinoForm.markAllAsTouched();
    this.addPrestoForm.markAllAsTouched();
    this.addSnowflakeForm.markAllAsTouched();
    this.addApiForm.markAllAsTouched();
    this.addGoogleApiForm.markAllAsTouched();

    let cType = this.addForm.value.type;

    if (
      !this.addForm.valid ||
      (cType === ConnectionTypeEnum.BigQuery && !this.addBigqueryForm.valid) ||
      (cType === ConnectionTypeEnum.ClickHouse &&
        !this.addClickhouseForm.valid) ||
      (cType === ConnectionTypeEnum.MotherDuck &&
        !this.addMotherduckForm.valid) ||
      (cType === ConnectionTypeEnum.PostgreSQL &&
        !this.addPostgresForm.valid) ||
      (cType === ConnectionTypeEnum.MySQL && !this.addMysqlForm.valid) ||
      (cType === ConnectionTypeEnum.Trino && !this.addTrinoForm.valid) ||
      (cType === ConnectionTypeEnum.Presto && !this.addPrestoForm.valid) ||
      (cType === ConnectionTypeEnum.SnowFlake &&
        !this.addSnowflakeForm.valid) ||
      (cType === ConnectionTypeEnum.Api && !this.addApiForm.valid) ||
      (cType === ConnectionTypeEnum.GoogleApi && !this.addGoogleApiForm.valid)
    ) {
      return;
    }

    this.ref.close();

    let bigqueryCredentials = isDefined(
      this.addBigqueryForm.value.serviceAccountCredentials
    )
      ? JSON.parse(this.addBigqueryForm.value.serviceAccountCredentials)
      : undefined;

    let googleApiCredentials = isDefined(
      this.addGoogleApiForm.value.serviceAccountCredentials
    )
      ? JSON.parse(this.addGoogleApiForm.value.serviceAccountCredentials)
      : undefined;

    let payload: ToBackendCreateConnectionRequestPayload = {
      projectId: this.ref.data.projectId,
      connectionId: this.addForm.value.connectionId,
      envId: this.addForm.value.envId,
      type: this.addForm.value.type,
      bigqueryOptions:
        cType === ConnectionTypeEnum.BigQuery
          ? {
              googleCloudProject: undefined,
              googleCloudClientEmail: undefined,
              serviceAccountCredentials: bigqueryCredentials,
              bigqueryQuerySizeLimitGb: isDefined(
                this.addBigqueryForm.value.bigqueryQuerySizeLimitGb
              )
                ? Number(this.addBigqueryForm.value.bigqueryQuerySizeLimitGb)
                : undefined
            }
          : undefined,
      clickhouseOptions:
        cType === ConnectionTypeEnum.ClickHouse
          ? {
              host: this.addClickhouseForm.value.host,
              port: isDefined(this.addClickhouseForm.value.port)
                ? Number(this.addClickhouseForm.value.port)
                : undefined,
              username: this.addClickhouseForm.value.username,
              password: this.addClickhouseForm.value.password,
              isSSL: this.isClickhouseSSL
            }
          : undefined,
      motherduckOptions:
        cType === ConnectionTypeEnum.MotherDuck
          ? {
              motherduckToken: this.addMotherduckForm.value.motherduckToken,
              database: this.addMotherduckForm.value.database,
              attachModeSingle:
                this.isMotherduckAttachModeSingle &&
                this.addMotherduckForm.controls['database'].value?.length > 0,
              accessModeReadOnly: this.isMotherduckAccessModeReadOnly
            }
          : undefined,
      postgresOptions:
        cType === ConnectionTypeEnum.PostgreSQL
          ? {
              host: this.addPostgresForm.value.host,
              port: isDefined(this.addPostgresForm.value.port)
                ? Number(this.addPostgresForm.value.port)
                : undefined,
              database: this.addPostgresForm.value.database,
              username: this.addPostgresForm.value.username,
              password: this.addPostgresForm.value.password,
              isSSL: this.isPostgresSSL
            }
          : undefined,
      mysqlOptions:
        cType === ConnectionTypeEnum.MySQL
          ? {
              host: this.addMysqlForm.value.host,
              port: isDefined(this.addMysqlForm.value.port)
                ? Number(this.addMysqlForm.value.port)
                : undefined,
              database: this.addMysqlForm.value.database,
              user: this.addMysqlForm.value.user,
              password: this.addMysqlForm.value.password
            }
          : undefined,
      trinoOptions:
        cType === ConnectionTypeEnum.Trino
          ? {
              server: this.addTrinoForm.value.server,
              catalog: this.addTrinoForm.value.catalog,
              schema: this.addTrinoForm.value.schema,
              user: this.addTrinoForm.value.user,
              password: this.addTrinoForm.value.password
            }
          : undefined,
      prestoOptions:
        cType === ConnectionTypeEnum.Presto
          ? {
              server: this.addPrestoForm.value.server,
              port: isDefined(this.addPrestoForm.value.port)
                ? Number(this.addPrestoForm.value.port)
                : undefined,
              catalog: this.addPrestoForm.value.catalog,
              schema: this.addPrestoForm.value.schema,
              user: this.addPrestoForm.value.user,
              password: this.addPrestoForm.value.password
            }
          : undefined,
      snowflakeOptions:
        cType === ConnectionTypeEnum.SnowFlake
          ? {
              account: this.addSnowflakeForm.value.account,
              warehouse: this.addSnowflakeForm.value.warehouse,
              database: this.addSnowflakeForm.value.database,
              username: this.addSnowflakeForm.value.username,
              password: this.addSnowflakeForm.value.password
            }
          : undefined,
      storeApiOptions:
        cType === ConnectionTypeEnum.Api
          ? {
              baseUrl: this.addApiForm.value.baseUrl,
              headers: this.addApiForm.value.headers
            }
          : undefined,
      storeGoogleApiOptions:
        cType === ConnectionTypeEnum.GoogleApi
          ? {
              googleAccessToken: undefined,
              googleCloudProject: undefined,
              googleCloudClientEmail: undefined,
              serviceAccountCredentials: googleApiCredentials,
              baseUrl: this.addGoogleApiForm.value.baseUrl,
              headers: this.addGoogleApiForm.value.headers,
              googleAuthScopes:
                [ConnectionTypeEnum.GoogleApi].indexOf(
                  this.addGoogleApiForm.get('type').value
                ) > -1
                  ? this.addGoogleApiForm.value.scopes.map((x: any) => x.value)
                  : []
            }
          : undefined
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateConnection,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendCreateConnectionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let connection = resp.payload.connection;

            let connections = this.connectionsQuery.getValue();

            let newSortedConnections = [
              ...connections.connections,
              connection
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
