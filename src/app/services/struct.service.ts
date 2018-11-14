import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import * as actions from 'app/store/actions/_index';
import * as api from 'app/api/_index';
import * as interfaces from 'app/interfaces/_index';
import * as selectors from 'app/store/selectors/_index';
import * as uuid from 'uuid';

@Injectable()
export class StructService {
  constructor(private store: Store<interfaces.AppState>) {}

  filterHasDuplicateFractions(filter: api.Filter) {
    let hasDuplicates = false;

    filter.fractions.forEach(fraction => {
      if (filter.fractions.filter(x => x.brick === fraction.brick).length > 1) {
        hasDuplicates = true;
      }
    });

    return hasDuplicates;
  }

  mconfigHasFiltersWithDuplicateFractions(mconfig: api.Mconfig) {
    let hasDuplicates = false;

    mconfig.filters.forEach(filter => {
      if (this.filterHasDuplicateFractions(filter)) {
        hasDuplicates = true;
      }
    });

    return hasDuplicates;
  }

  generateChart(): api.Chart {
    let newChartId = uuid.v4();

    return {
      // x_axis_tick_formatting:
      // y_axis_tick_formatting:
      // axisTickFormatting:
      // active_entries:
      // curve:
      // custom_colors:
      // label_formatting:
      // valueFormatting:
      chart_id: newChartId,
      is_valid: true,
      title: 'Untitled',
      type: api.ChartTypeEnum.Table,

      x_field: null,
      y_field: null,
      y_fields: [],
      hide_columns: [],
      multi_field: null,
      value_field: null,
      previous_value_field: null,

      x_axis: true,
      show_x_axis_label: false,
      x_axis_label: 'x axis label',
      y_axis: true,
      show_y_axis_label: false,
      y_axis_label: 'y axis label',
      show_axis: true,

      animations: false,
      gradient: false,
      legend: false,
      legend_title: 'Legend',
      tooltip_disabled: false,
      round_edges: true,
      round_domains: false,
      show_grid_lines: true,
      timeline: false,
      interpolation: api.ChartInterpolationEnum.Linear,
      auto_scale: true,
      doughnut: false,
      explode_slices: false,
      labels: false,
      color_scheme: api.ChartColorSchemeEnum.Cool,
      scheme_type: api.ChartSchemeTypeEnum.Ordinal,
      page_size: 500,
      arc_width: 0.25,
      bar_padding: 8,
      group_padding: 16,
      inner_padding: 8,
      range_fill_opacity: 0.15,
      angle_span: 240,
      start_angle: -120,
      big_segments: 10,
      small_segments: 5,
      min: 0,
      max: 100,
      units: null,
      y_scale_min: null,
      y_scale_max: null,
      x_scale_max: null,
      band_color: null,
      card_color: null,
      text_color: null,
      empty_color: null,

      tile_width: api.ChartTileWidthEnum._6,
      tile_height: api.ChartTileHeightEnum._500,
      view_size: api.ChartViewSizeEnum.Auto,
      view_width: 600,
      view_height: 200
    };
  }

  generateMconfig() {
    let newMconfigId = uuid.v4();

    let newQueryId: string;
    this.store
      .select(selectors.getSelectedQueryId)
      .pipe(take(1))
      .subscribe(x => (newQueryId = x));

    let newMconfig = this.prepareEmptyOrCopyMconfig(newMconfigId, newQueryId);

    return newMconfig;
  }

  generateMconfigAndQuery(): [api.Mconfig, api.Query] {
    let newMconfigId = uuid.v4();
    let newQueryId = uuid.v4();

    let newMconfig = this.prepareEmptyOrCopyMconfig(newMconfigId, newQueryId);
    let newQuery = this.prepareEmptyQuery(newQueryId);

    return [newMconfig, newQuery];
  }

  copyMconfigAndQuery(mconfigId: string): [api.Mconfig, api.Query] {
    let newMconfigId = uuid.v4();
    let newQueryId = uuid.v4();

    let newMconfig: api.Mconfig;
    let newQuery: api.Query;
    this.store
      .select(selectors.getMconfigsState)
      .pipe(take(1))
      .subscribe(mconfigs =>
        mconfigs.forEach(mconfig => {
          if (mconfig.mconfig_id === mconfigId) {
            this.store
              .select(selectors.getQueriesState)
              .pipe(take(1))
              .subscribe(queries =>
                queries.forEach(query => {
                  if (query.query_id === mconfig.query_id) {
                    newQuery = Object.assign({}, query, {
                      query_id: newQueryId,
                      status:
                        query.last_cancel_ts > query.last_complete_ts &&
                        query.last_cancel_ts > query.last_error_ts
                          ? api.QueryStatusEnum.Canceled
                          : query.last_error_ts > query.last_complete_ts &&
                            query.last_error_ts > query.last_cancel_ts
                          ? api.QueryStatusEnum.Error
                          : query.last_complete_ts > query.last_cancel_ts &&
                            query.last_complete_ts > query.last_error_ts
                          ? api.QueryStatusEnum.Completed
                          : api.QueryStatusEnum.New,
                      temp: true,
                      server_ts: 1
                    });
                  }
                })
              );

            newMconfig = Object.assign({}, mconfig, {
              mconfig_id: newMconfigId,
              query_id: newQueryId,
              temp: true,
              server_ts: 1
            });
          }
        })
      );

    this.store.dispatch(new actions.UpdateQueriesStateAction([newQuery]));
    this.store.dispatch(new actions.UpdateMconfigsStateAction([newMconfig]));

    return [newMconfig, newQuery];
  }

  generateEmptyFraction(): api.Fraction {
    return {
      brick: 'any',
      day_of_week_index_values: null,
      day_of_week_value: null,
      month_name_value: null,
      number_between_option: null,
      number_value1: null,
      number_value2: null,
      number_values: null,
      operator: api.FractionOperatorEnum.Or,
      quarter_of_year_value: null,
      string_value: null,
      ts_date_day: null,
      ts_date_hour: null,
      ts_date_minute: null,
      ts_date_month: null,
      ts_date_to_day: null,
      ts_date_to_hour: null,
      ts_date_to_minute: null,
      ts_date_to_month: null,
      ts_date_to_year: null,
      ts_date_year: null,
      ts_for_option: null,
      ts_for_unit: null,
      ts_for_value: null,
      ts_last_complete_option: null,
      ts_last_unit: null,
      ts_last_value: null,
      ts_relative_complete_option: null,
      ts_relative_unit: null,
      ts_relative_value: null,
      ts_relative_when_option: null,
      type: api.FractionTypeEnum.StringIsAnyValue, // 'any'
      yesno_value: null
    };
  }

  private prepareEmptyOrCopyMconfig(
    newMconfigId: string,
    newQueryId: string
  ): api.Mconfig {
    let projectId: string;
    this.store
      .select(selectors.getLayoutProjectId)
      .pipe(take(1))
      .subscribe(x => (projectId = x));

    let repoId: string;
    this.store
      .select(selectors.getSelectedProjectModeRepoId)
      .pipe(take(1))
      .subscribe(x => (repoId = x));

    let structId: string;
    this.store
      .select(selectors.getSelectedProjectModeRepoStructId)
      .pipe(take(1))
      .subscribe(x => (structId = x));

    let modelId: string;
    this.store
      .select(selectors.getSelectedProjectModeRepoModelId)
      .pipe(take(1))
      .subscribe(x => (modelId = x));

    let mconfig: api.Mconfig;
    this.store
      .select(selectors.getSelectedMconfig)
      .pipe(take(1))
      .subscribe(x => (mconfig = x));

    let projectTimezone: string;
    this.store
      .select(selectors.getSelectedProjectTimezone)
      .pipe(take(1))
      .subscribe(x => (projectTimezone = x));

    let userTimezone: string;
    this.store
      .select(selectors.getUserTimezone)
      .pipe(take(1))
      .subscribe(x => (userTimezone = x));

    let timezone = userTimezone === 'project' ? projectTimezone : userTimezone;

    let emptyMconfig: api.Mconfig = {
      mconfig_id: null,
      query_id: null,
      project_id: projectId,
      repo_id: repoId,
      struct_id: structId,
      model_id: modelId,
      select: [],
      sorts: null,
      timezone: timezone,
      limit: 500,
      sortings: [],
      filters: [],
      charts: [],
      temp: true,
      server_ts: 1
    };

    return Object.assign({}, mconfig || emptyMconfig, {
      mconfig_id: newMconfigId,
      query_id: newQueryId,
      temp: true,
      deleted: false,
      server_ts: 1
    });
  }

  private prepareEmptyQuery(newQueryId: string): api.Query {
    let projectId: string;
    this.store
      .select(selectors.getLayoutProjectId)
      .pipe(take(1))
      .subscribe(x => (projectId = x));

    let structId: string;
    this.store
      .select(selectors.getSelectedProjectModeRepoStructId)
      .pipe(take(1))
      .subscribe(x => (structId = x));

    return {
      query_id: newQueryId,
      project_id: projectId,
      struct_id: structId,
      pdt_deps: [],
      pdt_deps_all: [],
      sql: null,
      is_pdt: false,
      pdt_id: null,
      status: api.QueryStatusEnum.New,
      last_run_by: null,
      last_run_ts: 1,
      last_cancel_ts: 1,
      last_complete_ts: 1,
      last_complete_duration: null,
      last_error_message: null,
      last_error_ts: 1,
      data: null,
      temp: true,
      server_ts: 1
    };
  }
}
