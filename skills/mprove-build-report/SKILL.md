---
name: mprove-build-report
description: Build Mprove Report
---

# Build Mprove Report

https://docs.mprove.io/docs/reference/report

## Report Link URL Structure

The `run` MCP tool returns `RunReport` objects with a `url` property containing this URL (defaults applied). You can use it as-is or modify query parameters.

```
{host}/org/{orgId}/project/{projectId}/repo/{repoId}/branch/{branch}/env/{env}/reports/report/{reportId}?timezone={tz}&timeSpec={timeSpec}&timeRange={timeRange}
```

## Rules

If you build report with top parameters (filters). Rows should listen to them.

## Query Parameters

### timezone

IANA timezone identifier with `/` replaced by `-` in the URL.

- `America/New_York` → `America-New_York`
- `Europe/London` → `Europe-London`
- `UTC` → `UTC`

Default: project's `default_timezone` from mprove config.

### timeSpec

Time granularity for report time columns. One of:

`timestamps` | `seconds` | `minutes` | `hours` | `days` | `weeks` | `months` | `quarters` | `years`

Default: `days`

### timeRange

Malloy temporal filter expression in f-backtick format.

Default: `` f`last 5 days` ``

To put timeRange into the URL, replace `` ` `` with `%60` and space with `%20`:

`` f`last 5 days` `` → `f%60last%205%20days%60`

Prefer using the URL returned by the `run` MCP tool and only replacing the timeRange query param value when needed.

## Common timeRange Patterns

Raw values (before URL encoding):

Relative:

- `` f`last 5 days` ``
- `` f`last 2 weeks` ``
- `` f`last 3 months` ``
- `` f`last 4 quarters` ``

https://docs.mprove.io/docs/reference/filter-conditions#timestamp

## Example

Report showing last 3 months by month in US Eastern time:

```
{host}/org/{orgId}/project/{projectId}/repo/{repoId}/branch/main/env/prod/reports/report/{reportId}?timezone=America-New_York&timeSpec=months&timeRange=f%60last%203%20months%60
```

## Notes

- `timeSpec` should be consistent with the `timeRange` unit for meaningful results (e.g., `timeSpec=months` with `` f`last 6 months` ``, `timeSpec=days` with `` f`last 30 days` ``).
- Prefer using the URL from the `run` MCP tool directly. Only modify query params (`timezone`, `timeSpec`, `timeRange`) when needed.
- Charts and dashboards only use `timezone` as a query parameter. Reports are unique in also having `timeSpec` and `timeRange`.
