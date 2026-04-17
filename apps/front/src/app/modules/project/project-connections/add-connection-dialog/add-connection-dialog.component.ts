import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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
import { TippyDirective } from '@ngneat/helipopper';
import { UiSwitchModule } from 'ngx-ui-switch';
import { map, take, tap } from 'rxjs/operators';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { DatabricksAuthTypeEnum } from '#common/enums/databricks-auth-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import type { ConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import type { EnvsItem } from '#common/zod/backend/envs-item';
import type {
  ToBackendCreateConnectionRequestPayload,
  ToBackendCreateConnectionResponse
} from '#common/zod/to-backend/connections/to-backend-create-connection';
import type {
  TestConnectionResult,
  ToBackendTestConnectionRequestPayload,
  ToBackendTestConnectionResponse
} from '#common/zod/to-backend/connections/to-backend-test-connection';
import type {
  ToBackendGetEnvsListRequestPayload,
  ToBackendGetEnvsListResponse
} from '#common/zod/to-backend/envs/to-backend-get-envs-list';
import { SharedModule } from '#front/app/modules/shared/shared.module';
import { ConnectionsQuery } from '#front/app/queries/connections.query';
import { ApiService } from '#front/app/services/api.service';
import { ValidationService } from '#front/app/services/validation.service';

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
    NgSelectModule,
    TippyDirective
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
  }

  addForm: FormGroup;

  addBigqueryForm: FormGroup;
  // addClickhouseForm: FormGroup;
  addDatabricksForm: FormGroup;
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

  // isClickhouseSSL = true;
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
    ConnectionTypeEnum.Databricks,
    ConnectionTypeEnum.MotherDuck,
    ConnectionTypeEnum.Api,
    ConnectionTypeEnum.GoogleApi
  ];

  typePostgreSQL = ConnectionTypeEnum.PostgreSQL;
  typeMySQL = ConnectionTypeEnum.MySQL;
  typeTrino = ConnectionTypeEnum.Trino;
  typePresto = ConnectionTypeEnum.Presto;
  typeSnowFlake = ConnectionTypeEnum.SnowFlake;
  // typeClickHouse = ConnectionTypeEnum.ClickHouse;
  typeDatabricks = ConnectionTypeEnum.Databricks;
  databricksAuthTypes = [
    DatabricksAuthTypeEnum.OAuthM2M,
    DatabricksAuthTypeEnum.PersonalAccessToken
  ];
  databricksAuthTypeOAuthM2M = DatabricksAuthTypeEnum.OAuthM2M;
  databricksAuthTypePAT = DatabricksAuthTypeEnum.PersonalAccessToken;
  typeMotherDuck = ConnectionTypeEnum.MotherDuck;
  typeBigQuery = ConnectionTypeEnum.BigQuery;
  typeApi = ConnectionTypeEnum.Api;
  typeGoogleApi = ConnectionTypeEnum.GoogleApi;

  testConnectionResult: TestConnectionResult;
  testInternalHostResult: TestConnectionResult;

  constructor(
    public ref: DialogRef<AddConnectionDialogData>,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
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

    // this.addClickhouseForm = this.fb.group({
    //   host: [undefined, [Validators.required]],
    //   port: [
    //     undefined,
    //     [ValidationService.integerOrEmptyValidator, Validators.required]
    //   ],
    //   username: [undefined, [Validators.required]],
    //   password: [undefined, [Validators.required]]
    // });

    this.addMotherduckForm = this.fb.group({
      motherduckToken: [undefined, [Validators.required]],
      database: [undefined, [ValidationService.motherduckDatabaseWrongChars]]
    });

    this.addPostgresForm = this.fb.group({
      host: [undefined, [Validators.required]],
      internalHost: [undefined, []],
      port: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ],
      internalPort: [undefined, [ValidationService.integerOrEmptyValidator]],
      database: [undefined, [Validators.required]],
      username: [undefined, [Validators.required]],
      password: [undefined, [Validators.required]]
    });

    this.addMysqlForm = this.fb.group({
      host: [undefined, [Validators.required]],
      internalHost: [undefined, []],
      port: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ],
      internalPort: [undefined, [ValidationService.integerOrEmptyValidator]],
      database: [undefined, [Validators.required]],
      user: [undefined, [Validators.required]],
      password: [undefined, [Validators.required]]
    });

    this.addTrinoForm = this.fb.group({
      server: [undefined, [Validators.required]],
      internalServer: [undefined, []],
      catalog: [undefined, []],
      schema: [undefined, []],
      user: [undefined, [Validators.required]],
      password: [undefined, []]
    });

    this.addPrestoForm = this.fb.group({
      server: [undefined, [Validators.required]],
      internalServer: [undefined, []],
      port: [
        undefined,
        [ValidationService.integerOrEmptyValidator, Validators.required]
      ],
      internalPort: [undefined, [ValidationService.integerOrEmptyValidator]],
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

    this.addDatabricksForm = this.fb.group({
      authType: [DatabricksAuthTypeEnum.OAuthM2M, [Validators.required]],
      host: [undefined, [Validators.required]],
      internalHost: [undefined, []],
      path: [undefined, [Validators.required]],
      token: [undefined, []],
      oauthClientId: [undefined, [Validators.required]],
      oauthClientSecret: [undefined, [Validators.required]],
      defaultCatalog: [undefined, []],
      defaultSchema: [undefined, []]
    });

    this.addApiForm = this.fb.group({
      baseUrl: [undefined, [Validators.required]],
      headers: this.fb.array([])
    });

    this.addGoogleApiForm = this.fb.group({
      serviceAccountCredentials: [undefined, [Validators.required]],
      baseUrl: ['https://analyticsdata.googleapis.com', [Validators.required]],
      headers: this.fb.array([]),
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

      // this.addClickhouseForm.get('host').updateValueAndValidity();
      // this.addClickhouseForm.get('port').updateValueAndValidity();
      // this.addClickhouseForm.get('username').updateValueAndValidity();
      // this.addClickhouseForm.get('password').updateValueAndValidity();

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

      this.addDatabricksForm.get('authType').updateValueAndValidity();
      this.addDatabricksForm.get('host').updateValueAndValidity();
      this.addDatabricksForm.get('path').updateValueAndValidity();
      this.addDatabricksForm.get('token').updateValueAndValidity();
      this.addDatabricksForm.get('oauthClientId').updateValueAndValidity();
      this.addDatabricksForm.get('oauthClientSecret').updateValueAndValidity();
      this.addDatabricksForm.get('defaultCatalog').updateValueAndValidity();
      this.addDatabricksForm.get('defaultSchema').updateValueAndValidity();

      this.addApiForm.get('baseUrl').updateValueAndValidity();
      this.addApiForm.get('headers').updateValueAndValidity();

      this.addGoogleApiForm
        .get('serviceAccountCredentials')
        .updateValueAndValidity();
      this.addGoogleApiForm.get('baseUrl').updateValueAndValidity();
      this.addGoogleApiForm.get('headers').updateValueAndValidity();
      this.addGoogleApiForm.get('scopes').updateValueAndValidity();
    });

    this.addDatabricksForm
      .get('authType')
      .valueChanges.subscribe((authType: DatabricksAuthTypeEnum) => {
        if (authType === DatabricksAuthTypeEnum.OAuthM2M) {
          this.addDatabricksForm
            .get('oauthClientId')
            .setValidators([Validators.required]);
          this.addDatabricksForm
            .get('oauthClientSecret')
            .setValidators([Validators.required]);
          this.addDatabricksForm.get('token').clearValidators();
          this.addDatabricksForm.get('token').reset();
        } else {
          this.addDatabricksForm
            .get('token')
            .setValidators([Validators.required]);
          this.addDatabricksForm.get('oauthClientId').clearValidators();
          this.addDatabricksForm.get('oauthClientSecret').clearValidators();
          this.addDatabricksForm.get('oauthClientId').reset();
          this.addDatabricksForm.get('oauthClientSecret').reset();
        }
        this.addDatabricksForm.get('token').updateValueAndValidity();
        this.addDatabricksForm.get('oauthClientId').updateValueAndValidity();
        this.addDatabricksForm
          .get('oauthClientSecret')
          .updateValueAndValidity();
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

  // toggleClickhouseSSL() {
  //   this.isClickhouseSSL = !this.isClickhouseSSL;
  // }

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
          this.cd.detectChanges();
        }),
        take(1)
      )
      .subscribe();
  }

  changeType(type: ConnectionTypeEnum) {
    this.testConnectionResult = undefined;
    this.testInternalHostResult = undefined;

    if (type !== ConnectionTypeEnum.BigQuery) {
      this.addBigqueryForm.controls['serviceAccountCredentials'].reset();
      this.addBigqueryForm.controls['bigqueryQuerySizeLimitGb'].reset();
    }

    // if (type !== ConnectionTypeEnum.ClickHouse) {
    //   this.addClickhouseForm.controls['host'].reset();
    //   this.addClickhouseForm.controls['port'].reset();
    //   this.addClickhouseForm.controls['username'].reset();
    //   this.addClickhouseForm.controls['password'].reset();
    // }

    if (type !== ConnectionTypeEnum.MotherDuck) {
      this.addMotherduckForm.controls['motherduckToken'].reset();
      this.addMotherduckForm.controls['database'].reset();
    }

    if (type !== ConnectionTypeEnum.PostgreSQL) {
      this.addPostgresForm.controls['host'].reset();
      this.addPostgresForm.controls['internalHost'].reset();
      this.addPostgresForm.controls['port'].reset();
      this.addPostgresForm.controls['internalPort'].reset();
      this.addPostgresForm.controls['database'].reset();
      this.addPostgresForm.controls['username'].reset();
      this.addPostgresForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.MySQL) {
      this.addMysqlForm.controls['host'].reset();
      this.addMysqlForm.controls['internalHost'].reset();
      this.addMysqlForm.controls['port'].reset();
      this.addMysqlForm.controls['internalPort'].reset();
      this.addMysqlForm.controls['database'].reset();
      this.addMysqlForm.controls['user'].reset();
      this.addMysqlForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.Trino) {
      this.addTrinoForm.controls['server'].reset();
      this.addTrinoForm.controls['internalServer'].reset();
      this.addTrinoForm.controls['catalog'].reset();
      this.addTrinoForm.controls['schema'].reset();
      this.addTrinoForm.controls['user'].reset();
      this.addTrinoForm.controls['password'].reset();
    }

    if (type !== ConnectionTypeEnum.Presto) {
      this.addPrestoForm.controls['server'].reset();
      this.addPrestoForm.controls['internalServer'].reset();
      this.addPrestoForm.controls['port'].reset();
      this.addPrestoForm.controls['internalPort'].reset();
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

    if (type !== ConnectionTypeEnum.Databricks) {
      this.addDatabricksForm.controls['authType'].reset(
        DatabricksAuthTypeEnum.OAuthM2M
      );
      this.addDatabricksForm.controls['host'].reset();
      this.addDatabricksForm.controls['internalHost'].reset();
      this.addDatabricksForm.controls['path'].reset();
      this.addDatabricksForm.controls['token'].reset();
      this.addDatabricksForm.controls['oauthClientId'].reset();
      this.addDatabricksForm.controls['oauthClientSecret'].reset();
      this.addDatabricksForm.controls['defaultCatalog'].reset();
      this.addDatabricksForm.controls['defaultSchema'].reset();
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

    if (type === ConnectionTypeEnum.GoogleApi) {
      this.addGoogleApiForm = this.fb.group({
        serviceAccountCredentials: [undefined, [Validators.required]],
        baseUrl: [
          'https://analyticsdata.googleapis.com',
          [Validators.required]
        ],
        headers: this.fb.array([]),
        scopes: this.fb.array([
          this.fb.group({
            value: 'https://www.googleapis.com/auth/analytics.readonly'
          })
        ])
      });
    }
  }

  isPostgresInternalPairInvalid() {
    let host = this.addPostgresForm?.value?.internalHost;
    let port = this.addPostgresForm?.value?.internalPort;
    let hostSet = isDefined(host) && host !== '';
    let portSet = isDefined(port) && port !== '';
    return (hostSet && !portSet) || (!hostSet && portSet);
  }

  isMysqlInternalPairInvalid() {
    let host = this.addMysqlForm?.value?.internalHost;
    let port = this.addMysqlForm?.value?.internalPort;
    let hostSet = isDefined(host) && host !== '';
    let portSet = isDefined(port) && port !== '';
    return (hostSet && !portSet) || (!hostSet && portSet);
  }

  isPrestoInternalPairInvalid() {
    let server = this.addPrestoForm?.value?.internalServer;
    let port = this.addPrestoForm?.value?.internalPort;
    let serverSet = isDefined(server) && server !== '';
    let portSet = isDefined(port) && port !== '';
    return (serverSet && !portSet) || (!serverSet && portSet);
  }

  isCurrentInternalPairInvalid() {
    let cType = this.addForm?.value?.type;

    if (cType === ConnectionTypeEnum.PostgreSQL) {
      return this.isPostgresInternalPairInvalid();
    }
    if (cType === ConnectionTypeEnum.MySQL) {
      return this.isMysqlInternalPairInvalid();
    }
    if (cType === ConnectionTypeEnum.Presto) {
      return this.isPrestoInternalPairInvalid();
    }
    return false;
  }

  getInternalPairErrorMessage() {
    let cType = this.addForm?.value?.type;

    if (cType === ConnectionTypeEnum.Presto) {
      return 'Set both Internal Server and Internal Port, or neither';
    }
    return 'Set both Internal Host and Internal Port, or neither';
  }

  isInternalFieldsComplete() {
    let cType = this.addForm?.value?.type;

    if (cType === ConnectionTypeEnum.PostgreSQL) {
      let host = this.addPostgresForm?.value?.internalHost;
      let port = this.addPostgresForm?.value?.internalPort;
      return isDefined(host) && host !== '' && isDefined(port) && port !== '';
    }
    if (cType === ConnectionTypeEnum.MySQL) {
      let host = this.addMysqlForm?.value?.internalHost;
      let port = this.addMysqlForm?.value?.internalPort;
      return isDefined(host) && host !== '' && isDefined(port) && port !== '';
    }
    if (cType === ConnectionTypeEnum.Presto) {
      let server = this.addPrestoForm?.value?.internalServer;
      let port = this.addPrestoForm?.value?.internalPort;
      return (
        isDefined(server) && server !== '' && isDefined(port) && port !== ''
      );
    }
    if (cType === ConnectionTypeEnum.Trino) {
      let server = this.addTrinoForm?.value?.internalServer;
      return isDefined(server) && server !== '';
    }
    if (cType === ConnectionTypeEnum.Databricks) {
      let host = this.addDatabricksForm?.value?.internalHost;
      return isDefined(host) && host !== '';
    }
    return false;
  }

  prepareOptions() {
    this.addForm.markAllAsTouched();

    this.addBigqueryForm.markAllAsTouched();
    // this.addClickhouseForm.markAllAsTouched();
    this.addDatabricksForm.markAllAsTouched();
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
      // (cType === ConnectionTypeEnum.ClickHouse &&
      //   !this.addClickhouseForm.valid) ||
      (cType === ConnectionTypeEnum.MotherDuck &&
        !this.addMotherduckForm.valid) ||
      (cType === ConnectionTypeEnum.PostgreSQL &&
        !this.addPostgresForm.valid) ||
      (cType === ConnectionTypeEnum.MySQL && !this.addMysqlForm.valid) ||
      (cType === ConnectionTypeEnum.Trino && !this.addTrinoForm.valid) ||
      (cType === ConnectionTypeEnum.Presto && !this.addPrestoForm.valid) ||
      (cType === ConnectionTypeEnum.SnowFlake &&
        !this.addSnowflakeForm.valid) ||
      (cType === ConnectionTypeEnum.Databricks &&
        !this.addDatabricksForm.valid) ||
      (cType === ConnectionTypeEnum.Api && !this.addApiForm.valid) ||
      (cType === ConnectionTypeEnum.GoogleApi && !this.addGoogleApiForm.valid)
    ) {
      return;
    }

    let postgresInternalPairInvalid = this.isPostgresInternalPairInvalid();
    let mysqlInternalPairInvalid = this.isMysqlInternalPairInvalid();
    let prestoInternalPairInvalid = this.isPrestoInternalPairInvalid();

    if (
      (cType === ConnectionTypeEnum.PostgreSQL &&
        postgresInternalPairInvalid) ||
      (cType === ConnectionTypeEnum.MySQL && mysqlInternalPairInvalid) ||
      (cType === ConnectionTypeEnum.Presto && prestoInternalPairInvalid)
    ) {
      return;
    }

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

    let options: ConnectionOptions = {
      bigquery:
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
      // clickhouse:
      //   cType === ConnectionTypeEnum.ClickHouse
      //     ? {
      //         host: this.addClickhouseForm.value.host,
      //         port: isDefined(this.addClickhouseForm.value.port)
      //           ? Number(this.addClickhouseForm.value.port)
      //           : undefined,
      //         username: this.addClickhouseForm.value.username,
      //         password: this.addClickhouseForm.value.password,
      //         isSSL: this.isClickhouseSSL
      //       }
      //     : undefined,
      motherduck:
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
      postgres:
        cType === ConnectionTypeEnum.PostgreSQL
          ? {
              host: this.addPostgresForm.value.host,
              internalHost:
                this.addPostgresForm.value.internalHost || undefined,
              port: isDefined(this.addPostgresForm.value.port)
                ? Number(this.addPostgresForm.value.port)
                : undefined,
              internalPort:
                isDefined(this.addPostgresForm.value.internalPort) &&
                this.addPostgresForm.value.internalPort !== ''
                  ? Number(this.addPostgresForm.value.internalPort)
                  : undefined,
              database: this.addPostgresForm.value.database,
              username: this.addPostgresForm.value.username,
              password: this.addPostgresForm.value.password,
              isSSL: this.isPostgresSSL
            }
          : undefined,
      mysql:
        cType === ConnectionTypeEnum.MySQL
          ? {
              host: this.addMysqlForm.value.host,
              internalHost: this.addMysqlForm.value.internalHost || undefined,
              port: isDefined(this.addMysqlForm.value.port)
                ? Number(this.addMysqlForm.value.port)
                : undefined,
              internalPort:
                isDefined(this.addMysqlForm.value.internalPort) &&
                this.addMysqlForm.value.internalPort !== ''
                  ? Number(this.addMysqlForm.value.internalPort)
                  : undefined,
              database: this.addMysqlForm.value.database,
              user: this.addMysqlForm.value.user,
              password: this.addMysqlForm.value.password
            }
          : undefined,
      trino:
        cType === ConnectionTypeEnum.Trino
          ? {
              server: this.addTrinoForm.value.server,
              internalServer:
                this.addTrinoForm.value.internalServer || undefined,
              catalog: this.addTrinoForm.value.catalog,
              schema: this.addTrinoForm.value.schema,
              user: this.addTrinoForm.value.user,
              password: this.addTrinoForm.value.password
            }
          : undefined,
      presto:
        cType === ConnectionTypeEnum.Presto
          ? {
              server: this.addPrestoForm.value.server,
              internalServer:
                this.addPrestoForm.value.internalServer || undefined,
              port: isDefined(this.addPrestoForm.value.port)
                ? Number(this.addPrestoForm.value.port)
                : undefined,
              internalPort:
                isDefined(this.addPrestoForm.value.internalPort) &&
                this.addPrestoForm.value.internalPort !== ''
                  ? Number(this.addPrestoForm.value.internalPort)
                  : undefined,
              catalog: this.addPrestoForm.value.catalog,
              schema: this.addPrestoForm.value.schema,
              user: this.addPrestoForm.value.user,
              password: this.addPrestoForm.value.password
            }
          : undefined,
      snowflake:
        cType === ConnectionTypeEnum.SnowFlake
          ? {
              account: this.addSnowflakeForm.value.account,
              warehouse: this.addSnowflakeForm.value.warehouse,
              database: this.addSnowflakeForm.value.database,
              username: this.addSnowflakeForm.value.username,
              password: this.addSnowflakeForm.value.password
            }
          : undefined,
      databricks:
        cType === ConnectionTypeEnum.Databricks
          ? {
              authType: this.addDatabricksForm.value.authType,
              host: this.addDatabricksForm.value.host,
              internalHost:
                this.addDatabricksForm.value.internalHost || undefined,
              path: this.addDatabricksForm.value.path,
              token: this.addDatabricksForm.value.token,
              oauthClientId: this.addDatabricksForm.value.oauthClientId,
              oauthClientSecret: this.addDatabricksForm.value.oauthClientSecret,
              defaultCatalog: this.addDatabricksForm.value.defaultCatalog,
              defaultSchema: this.addDatabricksForm.value.defaultSchema
            }
          : undefined,
      storeApi:
        cType === ConnectionTypeEnum.Api
          ? {
              baseUrl: this.addApiForm.value.baseUrl,
              headers: this.addApiForm.value.headers
            }
          : undefined,
      storeGoogleApi:
        cType === ConnectionTypeEnum.GoogleApi
          ? {
              googleAccessToken: undefined,
              googleAccessTokenExpiryDate: undefined,
              googleCloudProject: undefined,
              googleCloudClientEmail: undefined,
              serviceAccountCredentials: googleApiCredentials,
              baseUrl: this.addGoogleApiForm.value.baseUrl,
              headers: this.addGoogleApiForm.value.headers,
              googleAuthScopes:
                [ConnectionTypeEnum.GoogleApi].indexOf(
                  this.addForm.get('type').value
                ) > -1
                  ? this.addGoogleApiForm.value.scopes.map((x: any) => x.value)
                  : []
            }
          : undefined
    };

    return options;
  }

  testConnection() {
    this.testConnectionResult = undefined;

    let options = this.prepareOptions();

    if (isUndefined(options)) {
      return;
    }

    if (isDefined(options.postgres)) {
      options.postgres.internalHost = undefined;
      options.postgres.internalPort = undefined;
    }
    if (isDefined(options.mysql)) {
      options.mysql.internalHost = undefined;
      options.mysql.internalPort = undefined;
    }
    if (isDefined(options.databricks)) {
      options.databricks.internalHost = undefined;
    }
    if (isDefined(options.trino)) {
      options.trino.internalServer = undefined;
    }
    if (isDefined(options.presto)) {
      options.presto.internalServer = undefined;
      options.presto.internalPort = undefined;
    }

    let payload: ToBackendTestConnectionRequestPayload = {
      projectId: this.ref.data.projectId,
      connectionId: this.addForm.value.connectionId,
      envId: this.addForm.value.envId,
      type: this.addForm.value.type,
      options: options,
      storeMethod: undefined
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendTestConnection,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendTestConnectionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.testConnectionResult = resp.payload.testConnectionResult;
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  testInternalHost() {
    this.testInternalHostResult = undefined;

    let options = this.prepareOptions();

    if (isUndefined(options)) {
      return;
    }

    let payload: ToBackendTestConnectionRequestPayload = {
      projectId: this.ref.data.projectId,
      connectionId: this.addForm.value.connectionId,
      envId: this.addForm.value.envId,
      type: this.addForm.value.type,
      options: options,
      storeMethod: undefined
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendTestConnection,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendTestConnectionResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.testInternalHostResult = resp.payload.testConnectionResult;
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }

  add() {
    let options = this.prepareOptions();

    if (isUndefined(options)) {
      return;
    }

    this.ref.close();

    let payload: ToBackendCreateConnectionRequestPayload = {
      projectId: this.ref.data.projectId,
      connectionId: this.addForm.value.connectionId,
      envId: this.addForm.value.envId,
      type: this.addForm.value.type,
      options: options
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
