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
import { DOUBLE_UNDERSCORE, MALLOY_FILTER_ANY } from '~common/constants/top';
import { FieldClassEnum } from '~common/enums/field-class.enum';
import { FractionOperatorEnum } from '~common/enums/fraction/fraction-operator.enum';
import { FractionTypeEnum } from '~common/enums/fraction/fraction-type.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { sleep } from '~common/functions/sleep';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { EventFractionUpdate } from '~common/interfaces/front/event-fraction-update';
import {
  ToBackendSuggestDimensionValuesRequestPayload,
  ToBackendSuggestDimensionValuesResponse
} from '~common/interfaces/to-backend/mconfigs/to-backend-suggest-dimension-values';
import {
  ToBackendGetQueryRequestPayload,
  ToBackendGetQueryResponse
} from '~common/interfaces/to-backend/queries/to-backend-get-query';
import {
  ToBackendRunQueriesRequestPayload,
  ToBackendRunQueriesResponse
} from '~common/interfaces/to-backend/queries/to-backend-run-queries';
import { MyRegex } from '~common/models/my-regex';
import { NavQuery } from '~front/app/queries/nav.query';
import { ApiService } from '~front/app/services/api.service';
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

  fractionOperatorEnum = FractionOperatorEnum;
  fractionTypeEnum = FractionTypeEnum;
  fieldClassEnum = FieldClassEnum;

  @Input() suggestModelDimension: string;
  @Input() structId: string;
  @Input() chartId: string;
  @Input() dashboardId: string;
  @Input() reportId: string;
  @Input() rowId: string;

  @Input() isDisabled: boolean;
  @Input() fraction: Fraction;
  @Input() fractionIndex: number;
  @Input() isFirst: boolean;

  @Output() fractionUpdate = new EventEmitter<EventFractionUpdate>();

  fractionForm: FormGroup;

  fractionStringTypesList: FractionTypeItem[] = [
    {
      label: 'is any value',
      value: FractionTypeEnum.StringIsAnyValue,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is equal to',
      value: FractionTypeEnum.StringIsEqualTo,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'starts with',
      value: FractionTypeEnum.StringStartsWith,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'ends with',
      value: FractionTypeEnum.StringEndsWith,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'contains',
      value: FractionTypeEnum.StringContains,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'matches',
      value: FractionTypeEnum.StringIsLike,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is null',
      value: FractionTypeEnum.StringIsNull,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is empty',
      value: FractionTypeEnum.StringIsEmpty,
      operator: FractionOperatorEnum.Or
    },
    {
      label: 'is not equal to',
      value: FractionTypeEnum.StringIsNotEqualTo,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'does not start with',
      value: FractionTypeEnum.StringDoesNotStartWith,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'does not end with',
      value: FractionTypeEnum.StringDoesNotEndWith,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'does not contain',
      value: FractionTypeEnum.StringDoesNotContain,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'does not match',
      value: FractionTypeEnum.StringIsNotLike,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'is not null',
      value: FractionTypeEnum.StringIsNotNull,
      operator: FractionOperatorEnum.And
    },
    {
      label: 'is not empty',
      value: FractionTypeEnum.StringIsNotEmpty,
      operator: FractionOperatorEnum.And
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
      isDefined(this.suggestModelDimension) &&
      (this.fraction.type === FractionTypeEnum.StringIsEqualTo ||
        this.fraction.type === FractionTypeEnum.StringIsNotEqualTo)
    ) {
      let reg = MyRegex.CAPTURE_SUGGEST_MODEL_FIELD_G();

      let r = reg.exec(this.suggestModelDimension);

      let modelId = r[1];
      let fieldId = r[2];

      this.searchSubscription = this.searchInput$
        .pipe(
          debounceTime(300), // Wait 300 ms after user stops typing
          distinctUntilChanged(), // Only trigger if the input has changed
          switchMap(async term => {
            try {
              this.loading = true;
              this.cd.detectChanges();

              // let newMconfig: Mconfig = {
              //   structId: this.structId,
              //   mconfigId: makeId(),
              //   queryId: makeId(),
              //   modelId: modelId,
              //   modelType: ModelTypeEnum.Malloy,
              //   parentType: MconfigParentTypeEnum.SuggestDimension,
              //   parentId: undefined,
              //   dateRangeIncludesRightSide: undefined,
              //   storePart: undefined,
              //   modelLabel: 'empty',
              //   modelFilePath: undefined,
              //   malloyQueryStable: undefined,
              //   malloyQueryExtra: undefined,
              //   compiledQuery: undefined,
              //   select: [],
              //   // unsafeSelect: [],
              //   // warnSelect: [],
              //   // joinAggregations: [],
              //   sortings: [],
              //   sorts: undefined,
              //   timezone: UTC,
              //   limit: 500,
              //   filters: [],
              //   chart: makeCopy(DEFAULT_CHART),
              //   serverTs: 1
              // };

              // let query;

              // let queryOperation1: QueryOperation = {
              //   type: QueryOperationTypeEnum.GroupOrAggregatePlusSort,
              //   fieldId: fieldId,
              //   sortFieldId: fieldId,
              //   desc: false,
              //   timezone: newMconfig.timezone
              // };

              // let queryOperation2: QueryOperation = {
              //   type: QueryOperationTypeEnum.WhereOrHaving,
              //   timezone: newMconfig.timezone,
              //   filters: [
              //     {
              //       fieldId: fieldId,
              //       fractions: [
              //         {
              //           brick: `f\`%${term}%\``,
              //           parentBrick: `f\`%${term}%\``,
              //           type: FractionTypeEnum.StringContains,
              //           operator: FractionOperatorEnum.Or,
              //           stringValue: term
              //         }
              //       ]
              //     }
              //   ]
              // };

              // let queryOperations: QueryOperation[] = isDefined(queryOperation2)
              //   ? [queryOperation1, queryOperation2]
              //   : [queryOperation1];

              let nav = this.navQuery.getValue();

              let payload: ToBackendSuggestDimensionValuesRequestPayload = {
                projectId: nav.projectId,
                isRepoProd: nav.isRepoProd,
                branchId: nav.branchId,
                envId: nav.envId,
                structId: this.structId,
                modelId: modelId,
                fieldId: fieldId,
                chartId: this.chartId,
                dashboardId: this.dashboardId,
                reportId: this.reportId,
                rowId: this.rowId,
                term: term,
                cellMetricsStartDateMs: undefined,
                cellMetricsEndDateMs: undefined
              };

              let q1Resp = await this.apiService
                .req({
                  pathInfoName:
                    ToBackendRequestInfoNameEnum.ToBackendSuggestDimensionValues,
                  payload: payload
                })
                .pipe(
                  tap((resp: ToBackendSuggestDimensionValuesResponse) => {
                    if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
                      return resp;
                    }
                  }),
                  take(1)
                )
                .toPromise();

              let q2Resp = await this.apiService
                .req({
                  pathInfoName:
                    ToBackendRequestInfoNameEnum.ToBackendRunQueries,
                  payload: {
                    projectId: nav.projectId,
                    isRepoProd: nav.isRepoProd,
                    branchId: nav.branchId,
                    envId: nav.envId,
                    mconfigIds: [q1Resp.payload.mconfig.mconfigId]
                    // queryIds: [q1Resp.payload.query.queryId]
                  } as ToBackendRunQueriesRequestPayload
                })
                .pipe(
                  tap((resp: ToBackendRunQueriesResponse) => {
                    if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
                      return resp;
                    }
                  }),
                  take(1)
                )
                .toPromise();

              let q3Resp: ToBackendGetQueryResponse;

              while (
                isUndefined(q3Resp) ||
                q3Resp?.payload.query.status === QueryStatusEnum.Running
              ) {
                await sleep(500);

                q3Resp = await this.apiService
                  .req({
                    pathInfoName:
                      ToBackendRequestInfoNameEnum.ToBackendGetQuery,
                    payload: {
                      projectId: nav.projectId,
                      isRepoProd: nav.isRepoProd,
                      branchId: nav.branchId,
                      envId: nav.envId,
                      mconfigId: q1Resp.payload.mconfig.mconfigId,
                      queryId: q2Resp.payload.runningQueries[0].queryId
                    } as ToBackendGetQueryRequestPayload
                  })
                  .pipe(
                    tap((resp: ToBackendGetQueryResponse) => {
                      if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
                        return resp;
                      }
                    })
                  )
                  .toPromise();
              }

              this.items = isDefined(q3Resp?.payload?.query?.data)
                ? q3Resp.payload.query.data.map((row: any, i: number) => ({
                    id: i,
                    name: row['row'][fieldId.split('.').join(DOUBLE_UNDERSCORE)]
                  }))
                : [];

              if (isDefinedAndNotEmpty(this.searchValue)) {
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

              if (q3Resp?.payload.query.status === QueryStatusEnum.Error) {
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
      fractionType === FractionTypeEnum.StringIsEqualTo
        ? `-${value}-`
        : fractionType === FractionTypeEnum.StringStartsWith
          ? `${value}%`
          : fractionType === FractionTypeEnum.StringEndsWith
            ? `%${value}`
            : fractionType === FractionTypeEnum.StringContains
              ? `%${value}%`
              : fractionType === FractionTypeEnum.StringIsLike
                ? `any` // TODO: remove
                : fractionType === FractionTypeEnum.StringIsNotEqualTo
                  ? `not -${value}-`
                  : fractionType === FractionTypeEnum.StringDoesNotStartWith
                    ? `${value}% not`
                    : fractionType === FractionTypeEnum.StringDoesNotEndWith
                      ? `not %${value}`
                      : fractionType === FractionTypeEnum.StringDoesNotContain
                        ? `not %${value}%`
                        : fractionType === FractionTypeEnum.StringIsNotLike
                          ? `any` // TODO: remove
                          : '';

    let mBrick =
      fractionType === FractionTypeEnum.StringIsEqualTo
        ? `f\`${value}\``
        : fractionType === FractionTypeEnum.StringStartsWith
          ? `f\`${value}%\``
          : fractionType === FractionTypeEnum.StringEndsWith
            ? `f\`%${value}\``
            : fractionType === FractionTypeEnum.StringContains
              ? `f\`%${value}%\``
              : fractionType === FractionTypeEnum.StringIsLike
                ? `f\`${value}\``
                : fractionType === FractionTypeEnum.StringIsNotEqualTo
                  ? `f\`-${value}\``
                  : fractionType === FractionTypeEnum.StringDoesNotStartWith
                    ? `f\`-${value}%\``
                    : fractionType === FractionTypeEnum.StringDoesNotEndWith
                      ? `f\`-%${value}\``
                      : fractionType === FractionTypeEnum.StringDoesNotContain
                        ? `f\`-%${value}%\``
                        : fractionType === FractionTypeEnum.StringIsNotLike
                          ? `f\`-${value}\``
                          : '';

    let newFraction: Fraction = {
      brick: isDefined(this.fraction.parentBrick) ? mBrick : sqlBrick,
      parentBrick: isDefined(this.fraction.parentBrick) ? mBrick : undefined,
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
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `any`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsEqualTo: {
        let mBrick = `f\`${this.defaultStringValue}\``;

        this.fraction = {
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `-${this.defaultStringValue}-`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `${this.defaultStringValue}%`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `%${this.defaultStringValue}`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `%${this.defaultStringValue}%`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `any`, // TODO: remove
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
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
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `null`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsEmpty: {
        let mBrick = 'f`empty`';

        this.fraction = {
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `blank`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.Or,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotEqualTo: {
        let mBrick = `f\`-${this.defaultStringValue}\``;

        this.fraction = {
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not -${this.defaultStringValue}-`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `${this.defaultStringValue}% not`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not %${this.defaultStringValue}`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
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
          brick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : `not %${this.defaultStringValue}%`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
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
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `any`, // TODO: remove
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
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
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `not blank`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
          type: fractionType
        };

        this.emitFractionUpdate();
        break;
      }

      case this.fractionTypeEnum.StringIsNotNull: {
        let mBrick = 'f`-null`';

        this.fraction = {
          brick: isDefined(this.fraction.parentBrick) ? mBrick : `not null`,
          parentBrick: isDefined(this.fraction.parentBrick)
            ? mBrick
            : undefined,
          operator: FractionOperatorEnum.And,
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
