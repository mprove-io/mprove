import { promises as dnsPromises, LookupAddress } from 'dns';
import ipaddr from 'ipaddr.js';
import { isPrivateIp } from '#backend/services/url/check-api-hostname/is-private-ip/is-private-ip';
import { ServerError } from '#common/classes/server-error/server-error';
import { isDefined } from '#common/functions/is-defined/is-defined';

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
export async function checkApiHostname(item: { hostname: string }) {
  let hostname = item.hostname;
  if (BLOCKED_SPEC_HOSTS.includes(hostname)) {
    throw new ServerError({
      message: 'BACKEND_API_HOST_IS_BLOCKED_BY_SPEC',
      displayData: { hostname: hostname, tag: 'instant', type: 'spec' }
    });
  }
  if (INTERNAL_DOMAIN_SUFFIXES.some(suffix => hostname.endsWith(suffix))) {
    throw new ServerError({
      message: 'BACKEND_API_HOST_IS_BLOCKED_BY_SUFFIX',
      displayData: { hostname: hostname, tag: 'instant', type: 'suffix' }
    });
  }
  let instantParsedIp = null;
  try {
    instantParsedIp = ipaddr.parse(hostname);
  } catch (e) {
    instantParsedIp = null; // Not a valid IP -> treat as hostname
  }
  if (instantParsedIp) {
    isPrivateIp({
      hostname: hostname,
      parsedIp: instantParsedIp,
      tag: 'instant',
      resolvedRecordAddress: undefined
    });
  }
  if (!instantParsedIp) {
    let records: LookupAddress[];
    try {
      records = await dnsPromises.lookup(hostname, { all: true });
    } catch (err) {
      throw new ServerError({
        message: 'BACKEND_API_HOST_DNS_LOOKUP_FAILED',
        displayData: { hostname: hostname },
        originalError: err
      });
    }
    records.forEach(record => {
      let resolvedParsedIp: any;
      try {
        resolvedParsedIp = ipaddr.parse(record.address);
      } catch {
        // skip check of record
      }
      if (isDefined(resolvedParsedIp)) {
        isPrivateIp({
          hostname: hostname,
          parsedIp: resolvedParsedIp,
          tag: 'resolved',
          resolvedRecordAddress: record.address
        });
      }
    });
  }
}
