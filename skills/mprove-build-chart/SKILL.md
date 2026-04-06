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

IANA timezone identifier with `/` replaced by `-` in the URL.

- `America/New_York` → `America-New_York`
- `Europe/London` → `Europe-London`
- `UTC` → `UTC`

Provided timezone is project's `default_timezone` from mprove config.
