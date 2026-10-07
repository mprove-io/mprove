import ipaddr from 'ipaddr.js';
import * as neoip from 'neoip';
import type { ApiHostnameCheckPhase } from '#backend/types/api-hostname-check-phase';
import { ServerError } from '#common/classes/server-error/server-error';

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
export function isPrivateIp(item: {
  hostname: string;
  parsedIp: any;
  resolvedRecordAddress: any;
  tag: ApiHostnameCheckPhase;
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
      message: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP',
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
      message: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP',
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
        message: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP',
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
        message: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP',
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
