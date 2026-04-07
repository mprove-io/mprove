---
name: mprove-build-dashboard
description: Build Mprove Dashboard
---

# Build Mprove Dashboard

https://docs.mprove.io/docs/reference/dashboard

## Dashboard Link URL Structure

The `run` MCP tool returns `RunDashboard` objects with a `url` property containing this URL.

```
{host}/org/{orgId}/project/{projectId}/repo/{repoId}/branch/{branch}/env/{env}/dashboards/dashboard/{dashboardId}?timezone={tz}
```

## Rules

If you build dashboard with top parameters (filters). Tiles should listen to them.

## Query Parameters

### timezone

IANA timezone identifier, URL-encoded.

- `America/New_York` → `America%2FNew_York`
- `America/Port-au-Prince` → `America%2FPort-au-Prince`
- `UTC` → `UTC`

Provided timezone is project's `default_timezone` from mprove config.
