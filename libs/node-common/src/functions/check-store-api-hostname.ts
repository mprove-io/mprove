import { LookupAddress, promises as dnsPromises } from 'dns';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { ServerError } from '~common/models/server-error';

let ipaddr = require('ipaddr.js');
let neoip = require('neoip');

// Non-public IPv4 CIDRs (IANA special-purpose)
let NON_PUBLIC_IPV4_CIDRS: readonly string[] = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '192.0.0.0/24',
  '192.0.2.0/24',
  '192.88.99.0/24',
  '192.168.0.0/16',
  '198.18.0.0/15',
  '198.51.100.0/24',
  '203.0.113.0/24',
  '224.0.0.0/4',
  '240.0.0.0/4',
  '255.255.255.255/32'
];

// Non-global IPv6 prefixes
let NON_GLOBAL_IPV6_PREFIXES: readonly string[] = [
  '::1/128', // Loopback
  '::ffff:0:0/96', // IPv4-mapped
  'fc00::/7', // Unique Local Address (ULA)
  'fe80::/10' // Link-local
];

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

export async function checkStoreApiHostname(item: { hostname: string }) {
  let hostname = item.hostname;

  if (BLOCKED_SPEC_HOSTS.includes(hostname)) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_SPEC,
      displayData: { hostname: hostname, tag: 'instant', type: 'spec' }
    });
  }

  if (INTERNAL_DOMAIN_SUFFIXES.some(suffix => hostname.endsWith(suffix))) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_SUFFIX,
      displayData: { hostname: hostname, tag: 'instant', type: 'suffix' }
    });
  }

  let instantParsedIp = null;

  try {
    instantParsedIp = ipaddr.parse(hostname);
  } catch (e) {
    instantParsedIp = null; // Not a valid IP → treat as hostname
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
        message: ErEnum.BACKEND_STORE_API_HOST_DNS_LOOKUP_FAILED,
        displayData: { hostname: hostname },
        originalError: err
      });
    }

    for (let record of records) {
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
    }
  }
}

function isPrivateIp(item: {
  hostname: string;
  parsedIp: any;
  resolvedRecordAddress: any;
  tag: 'instant' | 'resolved';
}) {
  let { hostname, parsedIp, resolvedRecordAddress, tag } = item;

  let kind = parsedIp.kind();
  let range = parsedIp.range();

  let ipString: string = tag === 'resolved' ? resolvedRecordAddress : hostname;

  if (
    [
      'loopback',
      'linkLocal',
      'uniqueLocal',
      'private',
      'reserved',
      'multicast',
      'carrierGradeNat'
    ].includes(range)
  ) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_IP,
      displayData: {
        hostname: hostname,
        ipString: ipString,
        resolvedRecordAddress: resolvedRecordAddress,
        tag: tag,
        type: 'ipaddr'
      }
    });
  }

  if (neoip.isPrivate(ipString)) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_IP,
      displayData: {
        hostname: hostname,
        ipString: ipString,
        resolvedRecordAddress: resolvedRecordAddress,
        tag: tag,
        type: 'neoip'
      }
    });
  }

  if (kind === 'ipv4') {
    if (
      NON_PUBLIC_IPV4_CIDRS.some((cidr: string) => {
        let [addr, prefix] = cidr.split('/');
        return parsedIp.match(ipaddr.parse(addr), Number(prefix));
      })
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_IP,
        displayData: {
          hostname: hostname,
          ipString: ipString,
          resolvedRecordAddress: resolvedRecordAddress,
          tag: tag,
          type: 'custom IPv4 CIDR'
        }
      });
    }
  } else if (kind === 'ipv6') {
    if (
      NON_GLOBAL_IPV6_PREFIXES.some((prefix: string) => {
        let [addr, prefixLen] = prefix.split('/');
        return parsedIp.match(ipaddr.parse(addr), Number(prefixLen));
      })
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_IP,
        displayData: {
          hostname: hostname,
          ipString: ipString,
          resolvedRecordAddress: resolvedRecordAddress,
          tag: tag,
          type: 'custom IPv6 prefix'
        }
      });
    }
  }
}
