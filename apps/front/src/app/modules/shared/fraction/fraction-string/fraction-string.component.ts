import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import {
  BehaviorSubject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  take,
  tap
} from 'rxjs';
import { MALLOY_FILTER_ANY } from '~common/constants/top';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { interfaces } from '~front/barrels/interfaces';
import { FractionTypeItem } from '../fraction.component';

@Component({
  standalone: false,
  selector: 'm-fraction-string',
  templateUrl: 'fraction-string.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FractionStringComponent implements OnInit, OnDestroy {
  @ViewChild('fractionStringTypeSelect', { static: false })
  fractionStringTypeSelectElement: NgSelectComponent;

  @ViewChild('stringValueSelect', { static: false })
  stringValueSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.fractionStringTypeSelectElement?.close();
    this.stringValueSelectElement?.close();
  }

  defaultStringValue = 'abc';

  fractionOperatorEnum = common.FractionOperatorEnum;
  fractionTypeEnum = common.FractionTypeEnum;
  fieldClassEnum = common.FieldClassEnum;

  @Input() suggestModelDimension: string;
  @Input() structId: string;

  @Input() isDisabled: boolean;
  @Input() fraction: common.Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<interfaces.EventFractionUpdate>();

  fractionForm: FormGroup;

  fractionStringTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: common.FractionTypeEnum.StringIsAnyValue,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is equal to',
      value: common.FractionTypeEnum.StringIsEqualTo,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'starts with',
      value: common.FractionTypeEnum.StringStartsWith,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'ends with',
      value: common.FractionTypeEnum.StringEndsWith,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'contains',
      value: common.FractionTypeEnum.StringContains,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'matches',
      value: common.FractionTypeEnum.StringIsLike,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: common.FractionTypeEnum.StringIsNull,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is empty',
      value: common.FractionTypeEnum.StringIsEmpty,
      operator: common.FractionOperatorEnum.Or
    },
    {
      label: 'is not equal to',
      value: common.FractionTypeEnum.StringIsNotEqualTo,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'does not start with',
      value: common.FractionTypeEnum.StringDoesNotStartWith,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'does not end with',
      value: common.FractionTypeEnum.StringDoesNotEndWith,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'does not contain',
      value: common.FractionTypeEnum.StringDoesNotContain,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'does not match',
      value: common.FractionTypeEnum.StringIsNotLike,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: common.FractionTypeEnum.StringIsNotNull,
      operator: common.FractionOperatorEnum.And
    },
    {
      label: 'is not empty',
      value: common.FractionTypeEnum.StringIsNotEmpty,
      operator: common.FractionOperatorEnum.And
    }
  ];

  loading = false;
  items: any[] = [];
  searchInput$ = new BehaviorSubject<string>('');

  searchValue: string;

  searchSubscription: Subscription;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.buildFractionForm();
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onCloseSelect() {
    this.searchValue = '';
    this.items = [];

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  onOpenSelect() {
    if (
      common.isDefined(this.suggestModelDimension) &&
      (this.fraction.type === common.FractionTypeEnum.StringIsEqualTo ||
        this.fraction.type === common.FractionTypeEnum.StringIsNotEqualTo)
    ) {
      let reg =
        common.MyRegex.CAPTURE_TRIPLE_REF_WITHOUT_BRACKETS_AND_WHITESPACES_G();

      let r = reg.exec(this.suggestModelDimension);

      let modelName = r[1];
      let asName = r[2];
      let fieldName = r[3];

      let fieldId = `${asName}.${fieldName}`;
      // let fieldSqlName = `${asName}_${fieldName}`;

      this.searchSubscription = this.searchInput$
        .pipe(
          debounceTime(300), // Wait 300 ms after user stops typing
          distinctUntilChanged(), // Only trigger if the input has changed
          switchMap(async term => {
            try {
              this.loading = true;
              this.cd.detectChanges();

              let newMconfig: common.Mconfig = {
                structId: this.structId,
                mconfigId: common.makeId(),
                queryId: common.makeId(),
                modelId: modelName,
                modelType: common.ModelTypeEnum.SQL, // TODO: modelType
                // isStoreModel:
                //   this.fraction.type === common.FractionTypeEnum.StoreFraction,
                dateRangeIncludesRightSide: undefined, // adjustMconfig overrides it
                storePart: undefined,
                modelLabel: 'empty',
                modelFilePath: undefined,
                malloyQuery: undefined,
                compiledQuery: undefined,
                select: [fieldId],
                unsafeSelect: [],
                warnSelect: [],
                joinAggregations: [],
                sortings: [],
                sorts: `${fieldId}`,
                timezone: common.UTC,
                limit: 500,
                filters: common.isDefinedAndNotEmpty(term)
                  ? [
                      {
                        fieldId: fieldId,
                        fractions: [
                          {
                            brick: `%${term}%`,
                            type: common.FractionTypeEnum.StringContains,
                            operator: common.FractionOperatorEnum.Or
                          }
                        ]
                      }
                    ]
                  : [],
                chart: common.makeCopy(common.DEFAULT_CHART),
                temp: true,
                serverTs: 1
              };

              let nav = this.navQuery.getValue();

              let q1Resp = await this.apiService
                .req({
                  pathInfoName:
                    apiToBackend.ToBackendRequestInfoNameEnum
                      .ToBackendCreateTempMconfigAndQuery,
                  payload: {
                    projectId: nav.projectId,
                    isRepoProd: nav.isRepoProd,
                    branchId: nav.branchId,
                    envId: nav.envId,
                    mconfig: newMconfig,
                    cellMetricsStartDateMs: undefined,
                    cellMetricsEndDateMs: undefined
                  } as apiToBackend.ToBackendCreateTempMconfigAndQueryRequestPayload
                })
                .pipe(
                  tap(
                    (
                      resp: apiToBackend.ToBackendCreateTempMconfigAndQueryResponse
                    ) => {
                      if (
                        resp.info?.status === common.ResponseInfoStatusEnum.Ok
                      ) {
                        return resp;
                      }
                    }
                  ),
                  take(1)
                )
                .toPromise();

              let q2Resp = await this.apiService
                .req({
                  pathInfoName:
                    apiToBackend.ToBackendRequestInfoNameEnum
                      .ToBackendRunQueries,
                  payload: {
                    projectId: nav.projectId,
                    isRepoProd: nav.isRepoProd,
                    branchId: nav.branchId,
                    envId: nav.envId,
                    mconfigIds: [q1Resp.payload.mconfig.mconfigId]
                    // queryIds: [q1Resp.payload.query.queryId]
                  } as apiToBackend.ToBackendRunQueriesRequestPayload
                })
                .pipe(
                  tap((resp: apiToBackend.ToBackendRunQueriesResponse) => {
                    if (
                      resp.info?.status === common.ResponseInfoStatusEnum.Ok
                    ) {
                      return resp;
                    }
                  }),
                  take(1)
                )
                .toPromise();

              let q3Resp: apiToBackend.ToBackendGetQueryResponse;

              while (
                common.isUndefined(q3Resp) ||
                q3Resp?.payload.query.status === common.QueryStatusEnum.Running
              ) {
                await common.sleep(500);

                q3Resp = await this.apiService
                  .req({
                    pathInfoName:
                      apiToBackend.ToBackendRequestInfoNameEnum
                        .ToBackendGetQuery,
                    payload: {
                      projectId: nav.projectId,
                      isRepoProd: nav.isRepoProd,
                      branchId: nav.branchId,
                      envId: nav.envId,
                      mconfigId: q1Resp.payload.mconfig.mconfigId,
                      queryId: q2Resp.payload.runningQueries[0].queryId
                    } as apiToBackend.ToBackendGetQueryRequestPayload
                  })
                  .pipe(
                    tap((resp: apiToBackend.ToBackendGetQueryResponse) => {
                      if (
                        resp.info?.status === common.ResponseInfoStatusEnum.Ok
                      ) {
                        return resp;
                      }
                    })
                  )
                  .toPromise();
              }

              this.items = common.isDefined(q3Resp?.payload?.query?.data)
                ? q3Resp.payload.query.data.map((row: any, i: number) => ({
                    id: i,
                    name: row[fieldId]
                  }))
                : [];

              if (common.isDefinedAndNotEmpty(this.searchValue)) {
                this.items = [
                  {
                    id: 0,
                    name: this.searchValue
                  },
                  ...this.items.map(item => {
                    let newItem = Object.assign(item, {
                      id: item.id + 1
                    });

                    return newItem;
                  })
                ];
              }

              if (
                q3Resp?.payload.query.status === common.QueryStatusEnum.Error
              ) {
                throw new Error(
                  `Suggest Values Query Error: ${q3Resp.payload.query.lastErrorMessage}`
                );
              }
            } catch (error: any) {
              this.loading = false;
              this.cd.detectChanges();

              throw new Error(
                `Failed to get filter suggestions: ${error.message}`
              );
            }

            this.loading = false;
            this.cd.detectChanges();

            return;
          })
        )
        .subscribe();
    }
  }

  buildFractionForm() {
    this.fractionForm = this.fb.group({
      stringValue: [
        this.fraction.stringValue,
        Validators.compose([Validators.required, Validators.maxLength(255)])
      ]
    });
  }

  stringValueSearch(searchObj: any) {
    this.searchValue = searchObj.term;
  }

  stringValueChange(event: any) {
    (document.activeElement as HTMLElement).blur();

    let value = this.fractionForm.controls['stringValue'].value;

    if (value !== this.fraction.stringValue) {
      this.fraction = this.getChangedFraction({ value: value });

      if (this.fractionForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  stringValueBlur() {
    let value = this.fractionForm.controls['stringValue'].value;

    if (value !== this.fraction.stringValue) {
      this.fraction = this.getChangedFraction({ value: value });

      if (this.fractionForm.valid) {
        this.emitFractionUpdate();
      }
    }
  }

  updateControlValueFromFraction() {
    this.fractionForm.controls['stringValue'].setValue(
      this.fraction.stringValue
    );
  }

  getChangedFraction(item: { value: string }) {
    let { value } = item;

    let fractionType = this.fraction.type;

    let sqlBrick =
      fractionType === common.FractionTypeEnum.StringIsEqualTo
        ? `-${value}-`
        : fractionType === common.FractionTypeEnum.StringStartsWith
          ? `${value}%`
          : fractionType === common.FractionTypeEnum.StringEndsWith
            ? `%${value}`
            : fractionType === common.FractionTypeEnum.StringContains
              ? `%${value}%`
              : fractionType === common.FractionTypeEnum.StringIsLike
                ? `any` // TODO: remove
                : fractionType === common.FractionTypeEnum.StringIsNotEqualTo
                  ? `not -${value}-`
                  : fractionType ===
                      common.FractionTypeEnum.StringDoesNotStartWith
                    ? `${value}% not`
                    : fractionType ===
                        common.FractionTypeEnum.StringDoesNotEndWith
                      ? `not %${value}`
                      : fractionType ===
                          common.FractionTypeEnum.StringDoesNotContain
                        ? `not %${value}%`
                        : fractionType ===
                            common.FractionTypeEnum.StringIsNotLike
                          ? `any` // TODO: remove
                          : '';

    let mBrick =
      fractionType === common.FractionTypeEnum.StringIsEqualTo
        ? `f\`${value}\``
        : fractionType === common.FractionTypeEnum.StringStartsWith
          ? `f\`${value}%\``
          : fractionType === common.FractionTypeEnum.StringEndsWith
            ? `f\`%${value}\``
            : fractionType === common.FractionTypeEnum.StringContains
              ? `f\`%${value}%\``
              : fractionType === common.FractionTypeEnum.StringIsLike
                ? `f\`${value}\``
                : fractionType === common.FractionTypeEnum.StringIsNotEqualTo
                  ? `f\`-${value}\``
                  : fractionType ===
                      common.FractionTypeEnum.StringDoesNotStartWith
                    ? `f\`-${value}%\``
                    : fractionType ===
                        common.FractionTypeEnum.StringDoesNotEndWith
                      ? `f\`-%${value}\``
                      : fractionType ===
                          common.FractionTypeEnum.StringDoesNotContain
                        ? `f\`-%${value}%\``
                        : fractionType ===
                            common.FractionTypeEnum.StringIsNotLike
                          ? `f\`-${value}\``
                          : '';

    let newFraction: common.Fraction = {
      brick: common.isDefined(this.fraction.parentBrick) ? mBrick : sqlBrick,
      parentBrick: common.isDefined(this.fraction.parentBrick)
        ? mBrick
        : undefined,
      operator: this.fraction.operator,
      type: fractionType,
      stringValue: value
    };

    return newFraction;
  }

  emitFractionUpdate() {
    this.fractionUpdate.emit({
      fraction: this.fraction,
      fractionIndex: this.fractionIndex
    });
  }

  typeChange(fractionTypeItem: FractionTypeItem) {
    let fractionType = fractionTypeItem.value;

    switch (fractionType) {
      case this.fractionTypeEnum.StringIsAnyValue: {
        let mBrick = MALLOY_FILTER_ANY;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsEqualTo: {
        let mBrick = `f\`${this.defaultStringValue}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `-${this.defaultStringValue}-`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringStartsWith: {
        let mBrick = `f\`${this.defaultStringValue}%\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `${this.defaultStringValue}%`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringEndsWith: {
        let mBrick = `f\`%${this.defaultStringValue}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `%${this.defaultStringValue}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringContains: {
        let mBrick = `f\`%${this.defaultStringValue}%\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `%${this.defaultStringValue}%`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringIsLike: {
        let mBrick = `f\`a%c\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`, // TODO: remove
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();

        break;
      }

      case this.fractionTypeEnum.StringIsNull: {
        let mBrick = 'f`null`';

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `null`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsEmpty: {
        let mBrick = 'f`empty`';

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `blank`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotEqualTo: {
        let mBrick = `f\`-${this.defaultStringValue}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not -${this.defaultStringValue}-`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringDoesNotStartWith: {
        let mBrick = `f\`-${this.defaultStringValue}%\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `${this.defaultStringValue}% not`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringDoesNotEndWith: {
        let mBrick = `f\`-%${this.defaultStringValue}\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not %${this.defaultStringValue}`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringDoesNotContain: {
        let mBrick = `f\`-%${this.defaultStringValue}%\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not %${this.defaultStringValue}%`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotLike: {
        let mBrick = `f\`-a%c\``;

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick) ? mBrick : `any`, // TODO: remove
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.And,
          type: fractionType,
          stringValue: this.defaultStringValue
        };

        this.updateControlValueFromFraction();
        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotEmpty: {
        let mBrick = 'f`-empty`';

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not blank`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotNull: {
        let mBrick = 'f`-null`';

        this.fraction = {
          brick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not null`,
          parentBrick: common.isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: common.FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      default: {
      }
    }
  }
}
