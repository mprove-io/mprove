import { ApRegex } from '../../barrels/am-regex';
import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';

export function wrapDashboards(item: {
  projectId: string;
  repoId: string;
  structId: string;
  dashboards: interfaces.Dashboard[];
}) {
  let wrappedDashboards: api.Dashboard[] = [];

  let wrappedMconfigs: api.Mconfig[] = [];
  let wrappedDashboardsQueries: api.Query[] = [];

  item.dashboards.forEach(x => {
    let wrappedDashboardFields: api.DashboardField[] = [];
    let wrappedReports: api.Report[] = [];

    x.fields.forEach(field => {
      wrappedDashboardFields.push({
        id: field.name,
        hidden:
          field.hidden && field.hidden.match(ApRegex.TRUE()) ? true : false,
        label: field.label,
        result: <any>field.result,
        fractions: <any>field.fractions,
        description: field.description,
        from_field: field.from_field
      });
    });

    x.reports.forEach(report => {
      // let bqViews = [];

      let filters: {
        field_id: string;
        fractions: api.Fraction[];
      }[] = [];

      Object.keys(report.filters_fractions).forEach(fieldId => {
        filters.push({
          field_id: fieldId,
          fractions: report.filters_fractions[fieldId] || []
        });
      });

      let mconfigId = helper.makeId();
      let queryId = helper.makeId();
      let chartId = helper.makeId();

      let chart: api.Chart = {
        chart_id: chartId,
        is_valid: true,
        title: report.title,
        description: report.description,
        type: <any>report.type,

        // data
        x_field: report.data ? report.data.x_field : undefined,
        y_field: report.data ? report.data.y_field : undefined,
        y_fields:
          report.data && report.data.y_fields ? report.data.y_fields : [],
        hide_columns:
          report.data && report.data.hide_columns
            ? report.data.hide_columns
            : [],
        multi_field: report.data ? report.data.multi_field : undefined,
        value_field: report.data ? report.data.value_field : undefined,
        previous_value_field: report.data
          ? report.data.previous_value_field
          : undefined,

        // axis
        x_axis:
          report.axis &&
          report.axis.x_axis &&
          report.axis.x_axis.match(ApRegex.FALSE())
            ? false
            : true,

        show_x_axis_label:
          report.axis &&
          report.axis.show_x_axis_label &&
          report.axis.show_x_axis_label.match(ApRegex.TRUE())
            ? true
            : false,

        x_axis_label:
          report.axis && report.axis.x_axis_label
            ? report.axis.x_axis_label
            : 'x axis label',

        y_axis:
          report.axis &&
          report.axis.y_axis &&
          report.axis.y_axis.match(ApRegex.FALSE())
            ? false
            : true,

        show_y_axis_label:
          report.axis &&
          report.axis.show_y_axis_label &&
          report.axis.show_y_axis_label.match(ApRegex.TRUE())
            ? true
            : false,

        y_axis_label:
          report.axis && report.axis.y_axis_label
            ? report.axis.y_axis_label
            : 'y axis label',

        show_axis:
          report.axis &&
          report.axis.show_axis &&
          report.axis.show_axis.match(ApRegex.FALSE())
            ? false
            : true,

        // options
        animations:
          report.options &&
          report.options.animations &&
          report.options.animations.match(ApRegex.TRUE())
            ? true
            : false,

        gradient:
          report.options &&
          report.options.gradient &&
          report.options.gradient.match(ApRegex.TRUE())
            ? true
            : false,

        legend:
          report.options &&
          report.options.legend &&
          report.options.legend.match(ApRegex.TRUE())
            ? true
            : false,

        legend_title:
          report.options && report.options.legend_title
            ? report.options.legend_title
            : 'Legend',

        tooltip_disabled:
          report.options &&
          report.options.tooltip_disabled &&
          report.options.tooltip_disabled.match(ApRegex.TRUE())
            ? true
            : false,

        round_edges:
          report.options &&
          report.options.round_edges &&
          report.options.round_edges.match(ApRegex.FALSE())
            ? false
            : true,

        round_domains:
          report.options &&
          report.options.round_domains &&
          report.options.round_domains.match(ApRegex.TRUE())
            ? true
            : false,

        show_grid_lines:
          report.options &&
          report.options.show_grid_lines &&
          report.options.show_grid_lines.match(ApRegex.FALSE())
            ? false
            : true,

        timeline:
          report.options &&
          report.options.timeline &&
          report.options.timeline.match(ApRegex.TRUE())
            ? true
            : false,

        interpolation:
          report.options && report.options.interpolation
            ? <any>report.options.interpolation
            : api.ChartInterpolationEnum.Linear,

        auto_scale:
          report.options &&
          report.options.auto_scale &&
          report.options.auto_scale.match(ApRegex.TRUE())
            ? true
            : false,

        doughnut:
          report.options &&
          report.options.doughnut &&
          report.options.doughnut.match(ApRegex.TRUE())
            ? true
            : false,

        explode_slices:
          report.options &&
          report.options.explode_slices &&
          report.options.explode_slices.match(ApRegex.TRUE())
            ? true
            : false,

        labels:
          report.options &&
          report.options.labels &&
          report.options.labels.match(ApRegex.TRUE())
            ? true
            : false,

        color_scheme:
          report.options && report.options.color_scheme
            ? <any>report.options.color_scheme
            : api.ChartColorSchemeEnum.Cool,
        scheme_type:
          report.options && report.options.scheme_type
            ? <any>report.options.scheme_type
            : api.ChartSchemeTypeEnum.Ordinal,
        page_size:
          report.options && report.options.page_size
            ? Number(report.options.page_size)
            : 500,
        arc_width:
          report.options && report.options.arc_width
            ? Number(report.options.arc_width)
            : 0.25,
        bar_padding:
          report.options && report.options.bar_padding
            ? Number(report.options.bar_padding)
            : 8,
        group_padding:
          report.options && report.options.group_padding
            ? Number(report.options.group_padding)
            : 16,
        inner_padding:
          report.options && report.options.inner_padding
            ? Number(report.options.inner_padding)
            : 8,
        range_fill_opacity:
          report.options && report.options.range_fill_opacity
            ? Number(report.options.range_fill_opacity)
            : 0.15,
        angle_span:
          report.options && report.options.angle_span
            ? Number(report.options.angle_span)
            : 240,
        start_angle:
          report.options && report.options.start_angle
            ? Number(report.options.start_angle)
            : -120,
        big_segments:
          report.options && report.options.big_segments
            ? Number(report.options.big_segments)
            : 10,
        small_segments:
          report.options && report.options.small_segments
            ? Number(report.options.small_segments)
            : 5,
        min:
          report.options && report.options.min ? Number(report.options.min) : 0,
        max:
          report.options && report.options.max
            ? Number(report.options.max)
            : 100,

        units: report.options ? report.options.units : undefined,

        y_scale_min:
          report.options && report.options.y_scale_min
            ? Number(report.options.y_scale_min)
            : undefined,

        x_scale_max:
          report.options && report.options.x_scale_max
            ? Number(report.options.x_scale_max)
            : undefined,

        y_scale_max:
          report.options && report.options.y_scale_max
            ? Number(report.options.y_scale_max)
            : undefined,

        band_color: report.options ? report.options.band_color : undefined,
        card_color: report.options ? report.options.card_color : undefined,
        text_color: report.options ? report.options.text_color : undefined,
        empty_color: report.options
          ? report.options.empty_color
          : 'rgba(0, 0, 0, 0)',

        // tile
        tile_width:
          report.tile && report.tile.tile_width
            ? <any>report.tile.tile_width
            : api.ChartTileWidthEnum._6,
        tile_height:
          report.tile && report.tile.tile_height
            ? <any>report.tile.tile_height
            : api.ChartTileHeightEnum._500,
        view_size:
          report.tile && report.tile.view_size
            ? <any>report.tile.view_size
            : api.ChartViewSizeEnum.Auto,
        view_width:
          report.tile && report.tile.view_width
            ? Number(report.tile.view_width)
            : 600,
        view_height:
          report.tile && report.tile.view_height
            ? Number(report.tile.view_height)
            : 200
      };

      let mconfig: api.Mconfig = {
        mconfig_id: mconfigId,
        query_id: queryId,
        project_id: item.projectId,
        repo_id: item.repoId,
        struct_id: item.structId,
        model_id: report.model,
        select: report.select,
        sortings: report.sortings_ary.map(s => ({
          field_id: s.field_id,
          desc: s.desc && s.desc.match(ApRegex.TRUE()) ? true : false
        })),
        sorts: report.sorts,
        timezone: report.timezone,
        limit: report.limit ? Number(report.limit) : undefined,
        filters: filters,
        charts: [chart],
        temp: false,
        server_ts: 1
      };

      let query: api.Query = {
        query_id: queryId,
        project_id: item.projectId,
        struct_id: item.structId,
        pdt_deps: report.bq_views[0].pdt_deps,
        pdt_deps_all: report.bq_views[0].pdt_deps_all,
        sql: report.bq_views[0].sql,
        is_pdt: false,
        pdt_id: null,
        status: api.QueryStatusEnum.New,
        last_run_by: undefined,
        last_run_ts: 1,
        last_cancel_ts: 1,
        last_complete_ts: 1,
        last_complete_duration: undefined,
        last_error_message: undefined,
        last_error_ts: 1,
        data: undefined,
        temp: false,
        server_ts: 1
      };

      wrappedMconfigs.push(mconfig);

      wrappedDashboardsQueries.push(query);

      wrappedReports.push({
        mconfig_id: mconfigId,
        query_id: queryId
      });
    });

    wrappedDashboards.push({
      project_id: item.projectId,
      repo_id: item.repoId,
      dashboard_id: x.name,
      struct_id: item.structId,
      content: JSON.stringify(x),
      access_users: x.access_users || [],
      title: x.title,
      gr: x.group ? x.group : undefined,
      hidden: x.hidden && x.hidden.match(ApRegex.TRUE()) ? true : false,
      fields: wrappedDashboardFields,
      reports: wrappedReports,
      temp: false,
      server_ts: 1,
      // not required:
      description: x.description
    });
  });

  return {
    wrappedDashboards: wrappedDashboards,
    wrappedMconfigs: wrappedMconfigs,
    wrappedDashboardsQueries: wrappedDashboardsQueries
  };
}
