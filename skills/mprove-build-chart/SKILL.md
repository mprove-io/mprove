---
name: mprove-build-chart
description: Build Mprove Chart
---

# Build Mprove Chart

https://docs.mprove.io/docs/reference/chart

## Chart Link URL Structure

The `run` MCP tool returns `RunChart` objects with a `url` property containing this URL.

```
{host}/org/{orgId}/project/{projectId}/repo/{repoId}/branch/{branch}/env/{env}/models/model/{modelId}/chart/{chartId}?timezone={tz}
```

## Query Parameters

### timezone

IANA timezone identifier, URL-encoded.

- `America/New_York` → `America%2FNew_York`
- `America/Port-au-Prince` → `America%2FPort-au-Prince`
- `UTC` → `UTC`

Provided timezone is project's `default_timezone` from mprove config.
