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
import { conditionalValidator } from '~front/app/functions/conditional-validator';
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

  addConnectionForm: FormGroup;

  envsList: EnvsItem[] = [];
  envsListLoading = false;
  envsListLength = 0;

  isSSL = true;

  connectionTypes = [
    ConnectionTypeEnum.PostgreSQL,
    ConnectionTypeEnum.SnowFlake,
    ConnectionTypeEnum.ClickHouse,
    ConnectionTypeEnum.BigQuery,
    ConnectionTypeEnum.GoogleApi,
    ConnectionTypeEnum.Api
  ];

  typePostgreSQL = ConnectionTypeEnum.PostgreSQL;
  typeSnowFlake = ConnectionTypeEnum.SnowFlake;
  typeClickHouse = ConnectionTypeEnum.ClickHouse;
  typeBigQuery = ConnectionTypeEnum.BigQuery;
  typeGoogleApi = ConnectionTypeEnum.GoogleApi;
  typeApi = ConnectionTypeEnum.Api;

  constructor(
    public ref: DialogRef<AddConnectionDialogData>,
    private fb: FormBuilder,
    private connectionsQuery: ConnectionsQuery
  ) {}

  ngOnInit() {
    this.addConnectionForm = this.fb.group({
      connectionId: [
        undefined,
        [
          Validators.required,
          ValidationService.connectionNameWrongChars,
          Validators.maxLength(255)
        ]
      ],
      envId: [PROJECT_ENV_PROD],
      type: [ConnectionTypeEnum.PostgreSQL],
      baseUrl: [
        undefined,
        [
          conditionalValidator(
            () =>
              [ConnectionTypeEnum.GoogleApi, ConnectionTypeEnum.Api].indexOf(
                this.addConnectionForm.get('type').value
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
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      bigqueryQuerySizeLimitGb: [
        1,
        [
          ValidationService.integerOrEmptyValidator,
          conditionalValidator(
            () =>
              [ConnectionTypeEnum.BigQuery].indexOf(
                this.addConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      account: [
        undefined,
        [
          conditionalValidator(
            () =>
              [ConnectionTypeEnum.SnowFlake].indexOf(
                this.addConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      warehouse: [
        undefined,
        [
          conditionalValidator(
            () =>
              [ConnectionTypeEnum.SnowFlake].indexOf(
                this.addConnectionForm.get('type').value
              ) > -1,
            Validators.required
          )
        ]
      ],
      host: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                ConnectionTypeEnum.PostgreSQL,
                ConnectionTypeEnum.ClickHouse
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      port: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                ConnectionTypeEnum.PostgreSQL,
                ConnectionTypeEnum.ClickHouse
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      database: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                ConnectionTypeEnum.PostgreSQL
                // ,
                // ConnectionTypeEnum.ClickHouse
                // ,
                // ConnectionTypeEnum.SnowFlake
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      username: [
        undefined,
        [
          conditionalValidator(
            () =>
              [
                ConnectionTypeEnum.PostgreSQL,
                ConnectionTypeEnum.ClickHouse,
                ConnectionTypeEnum.SnowFlake
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
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
              ].indexOf(this.addConnectionForm.get('type').value) > -1,
            Validators.required
          )
        ]
      ],
      scopes: this.fb.array([
        this.fb.group({
          value: 'https://www.googleapis.com/auth/analytics.readonly'
        })
      ]),
      headers: this.fb.array([])
      // headers: this.fb.array([
      //   this.fb.group({ key: 'a1', value: 'v1' }),
      //   this.fb.group({ key: 'a2', value: 'v2' })
      // ])
    });

    this.addConnectionForm.get('type').valueChanges.subscribe(value => {
      this.addConnectionForm.get('baseUrl').updateValueAndValidity();
      this.addConnectionForm
        .get('serviceAccountCredentials')
        .updateValueAndValidity();
      this.addConnectionForm
        .get('bigqueryQuerySizeLimitGb')
        .updateValueAndValidity();
      this.addConnectionForm.get('account').updateValueAndValidity();
      this.addConnectionForm.get('warehouse').updateValueAndValidity();
      this.addConnectionForm.get('host').updateValueAndValidity();
      this.addConnectionForm.get('port').updateValueAndValidity();
      this.addConnectionForm.get('database').updateValueAndValidity();
      this.addConnectionForm.get('username').updateValueAndValidity();
      this.addConnectionForm.get('password').updateValueAndValidity();
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  getHeaders(): FormArray {
    return this.addConnectionForm.controls['headers'] as FormArray;
  }

  getScopes(): FormArray {
    return this.addConnectionForm.controls['scopes'] as FormArray;
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
    console.log(this.addConnectionForm.get('headers').value);
    console.log(this.addConnectionForm.get('scopes').value);
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
    if (
      [ConnectionTypeEnum.GoogleApi, ConnectionTypeEnum.Api].indexOf(type) < 0
    ) {
      this.addConnectionForm.controls['baseUrl'].reset();
      this.addConnectionForm.controls['headers'].reset();
      this.addConnectionForm.controls['scopes'].reset();
    }

    if ([ConnectionTypeEnum.GoogleApi].indexOf(type) > -1) {
      this.addConnectionForm.controls['baseUrl'].setValue(
        'https://analyticsdata.googleapis.com'
      );
    }

    if ([ConnectionTypeEnum.Api].indexOf(type) > -1) {
      this.addConnectionForm.controls['baseUrl'].reset();
    }

    if (
      [ConnectionTypeEnum.BigQuery, ConnectionTypeEnum.GoogleApi].indexOf(
        type
      ) < 0
    ) {
      this.addConnectionForm.controls['serviceAccountCredentials'].reset();
    }

    if (type !== ConnectionTypeEnum.BigQuery) {
      this.addConnectionForm.controls['bigqueryQuerySizeLimitGb'].reset();
    }

    if (type !== ConnectionTypeEnum.SnowFlake) {
      this.addConnectionForm.controls['account'].reset();
      this.addConnectionForm.controls['warehouse'].reset();
    }

    if (
      [
        ConnectionTypeEnum.SnowFlake,
        ConnectionTypeEnum.ClickHouse,
        ConnectionTypeEnum.PostgreSQL
      ].indexOf(type) < 0
    ) {
      this.addConnectionForm.controls['username'].reset();
      this.addConnectionForm.controls['password'].reset();
    }

    if (
      [
        ConnectionTypeEnum.PostgreSQL,
        ConnectionTypeEnum.ClickHouse,
        ConnectionTypeEnum.SnowFlake
      ].indexOf(type) < 0
    ) {
      this.addConnectionForm.controls['host'].reset();
      this.addConnectionForm.controls['port'].reset();
      this.addConnectionForm.controls['database'].reset();
    }
  }

  toggleSSL() {
    this.isSSL = !this.isSSL;
  }

  add() {
    this.addConnectionForm.markAllAsTouched();

    if (!this.addConnectionForm.valid) {
      return;
    }

    this.ref.close();

    let payload: ToBackendCreateConnectionRequestPayload = {
      projectId: this.ref.data.projectId,
      connectionId: this.addConnectionForm.value.connectionId,
      envId: this.addConnectionForm.value.envId,
      type: this.addConnectionForm.value.type,
      baseUrl: this.addConnectionForm.value.baseUrl,
      serviceAccountCredentials: isDefined(
        this.addConnectionForm.value.serviceAccountCredentials
      )
        ? JSON.parse(this.addConnectionForm.value.serviceAccountCredentials)
        : undefined,
      headers: this.addConnectionForm.value.headers,
      googleAuthScopes:
        [ConnectionTypeEnum.GoogleApi].indexOf(
          this.addConnectionForm.get('type').value
        ) > -1
          ? this.addConnectionForm.value.scopes.map((x: any) => x.value)
          : [],
      bigqueryQuerySizeLimitGb: isDefined(
        this.addConnectionForm.value.bigqueryQuerySizeLimitGb
      )
        ? Number(this.addConnectionForm.value.bigqueryQuerySizeLimitGb)
        : undefined,
      account: this.addConnectionForm.value.account,
      warehouse: this.addConnectionForm.value.warehouse,
      host: this.addConnectionForm.value.host,
      port: isDefined(this.addConnectionForm.value.port)
        ? Number(this.addConnectionForm.value.port)
        : undefined,
      database: this.addConnectionForm.value.database,
      username: this.addConnectionForm.value.username,
      password: this.addConnectionForm.value.password,
      isSSL: this.isSSL
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
