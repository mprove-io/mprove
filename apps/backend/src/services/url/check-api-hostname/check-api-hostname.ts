import { promises as dnsPromises, type LookupAddress } from 'node:dns';
import { Result } from '@praha/byethrow';
import ipaddr from 'ipaddr.js';
import { isPrivateIp } from '#backend/services/url/check-api-hostname/is-private-ip/is-private-ip';
import type { ApiHostnameCheckPhase } from '#backend/types/api-hostname-check-phase';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { BackendApiHostDnsLookupFailedError } from '#common/types/backend/errors/backend-api-host-dns-lookup-failed-error';
import type { CheckApiHostnameError } from '#common/types/backend/function-errors/check-api-hostname-error';
import { wrapError } from '#node-common/functions/wrap-error/wrap-error';

type ParseHostnamePayload = {
  parsedIp?: ipaddr.IPv4 | ipaddr.IPv6;
};

let BLOCKED_SPEC_HOSTS: readonly string[] = [
  'host.docker.internal',
  'gateway.docker.internal',
  'docker.host.internal'
];

// Internal domain suffixes
let INTERNAL_DOMAIN_SUFFIXES: readonly string[] = [
  '.svc.cluster.local',
  '.cluster.local',
  '.svc',
  '.internal',
  '.local',
  '.localhost'
];

export async function checkApiHostname(item: {
  hostname: string;
}): Result.ResultAsync<void, CheckApiHostnameError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v =>
      BLOCKED_SPEC_HOSTS.includes(v.hostname)
        ? Result.fail({
            code: 'BACKEND_API_HOST_IS_BLOCKED_BY_SPEC',
            displayData: {
              hostname: v.hostname,
              tag: 'instant' satisfies ApiHostnameCheckPhase,
              type: 'spec'
            }
          })
        : Result.succeed()
    ),
    Result.andThrough(v =>
      INTERNAL_DOMAIN_SUFFIXES.some(suffix => v.hostname.endsWith(suffix))
        ? Result.fail({
            code: 'BACKEND_API_HOST_IS_BLOCKED_BY_SUFFIX',
            displayData: {
              hostname: v.hostname,
              tag: 'instant' satisfies ApiHostnameCheckPhase,
              type: 'suffix'
            }
          })
        : Result.succeed()
    ),
    Result.bind(
      'parseHostnamePayload',
      (v): Result.Result<ParseHostnamePayload, never> => {
        let parsedIp: ipaddr.IPv4 | ipaddr.IPv6;

        try {
          parsedIp = ipaddr.parse(v.hostname);
        } catch {
          // Not a valid IP: treat it as a hostname, retaining DNS validation.
          return Result.succeed({});
        }

        return Result.succeed({ parsedIp: parsedIp });
      }
    ),
    Result.andThrough(v =>
      isDefined(v.parseHostnamePayload.parsedIp)
        ? isPrivateIp({
            hostname: v.hostname,
            parsedIp: v.parseHostnamePayload.parsedIp,
            tag: 'instant',
            resolvedRecordAddress: undefined
          })
        : Result.succeed()
    ),
    Result.bind(
      'records',
      async (
        v
      ): Result.ResultAsync<
        LookupAddress[],
        BackendApiHostDnsLookupFailedError
      > =>
        isDefined(v.parseHostnamePayload.parsedIp)
          ? Result.succeed([])
          : Result.try({
              try: () => dnsPromises.lookup(v.hostname, { all: true }),
              catch: error => ({
                code: 'BACKEND_API_HOST_DNS_LOOKUP_FAILED',
                displayData: { hostname: v.hostname },
                customData: isDefined(error)
                  ? {
                      originalError:
                        error instanceof Error ? wrapError(error) : error
                    }
                  : undefined
              })
            })
    ),
    Result.andThrough(v =>
      Result.sequence(v.records, record => {
        let parsedIp: ipaddr.IPv4 | ipaddr.IPv6;

        try {
          parsedIp = ipaddr.parse(record.address);
        } catch {
          // Preserve the existing bypass for an unparseable DNS record.
          return Result.succeed();
        }

        return isPrivateIp({
          hostname: v.hostname,
          parsedIp: parsedIp,
          tag: 'resolved',
          resolvedRecordAddress: record.address
        });
      })
    ),
    Result.map((v): void => undefined)
  );
}
