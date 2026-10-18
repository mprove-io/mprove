import { Result } from '@praha/byethrow';
import ipaddr from 'ipaddr.js';
import * as neoip from 'neoip';
import type { ApiHostnameCheckPhase } from '#backend/types/api-hostname-check-phase';
import type { IsPrivateIpError } from '#common/types/backend/function-errors/is-private-ip-error';

type IpRange = ReturnType<ipaddr.IPv4['range'] | ipaddr.IPv6['range']>;

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
  parsedIp: ipaddr.IPv4 | ipaddr.IPv6;
  resolvedRecordAddress?: string;
  tag: ApiHostnameCheckPhase;
}): Result.Result<void, IsPrivateIpError> {
  let { hostname, parsedIp, resolvedRecordAddress, tag } = item;

  let kind: ReturnType<ipaddr.IPv4['kind'] | ipaddr.IPv6['kind']> =
    parsedIp.kind();

  let range: IpRange = parsedIp.range();

  let ipString: string = tag === 'resolved' ? resolvedRecordAddress : hostname;

  if (
    (
      [
        'loopback',
        'linkLocal',
        'uniqueLocal',
        'private',
        'reserved',
        'multicast',
        'carrierGradeNat'
      ] satisfies IpRange[]
    ).some(blockedRange => blockedRange === range)
  ) {
    return Result.fail({
      code: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP',
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
    return Result.fail({
      code: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP',
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
        let [addr, prefix]: string[] = cidr.split('/');

        let network: ipaddr.IPv4 | ipaddr.IPv6 = ipaddr.parse(addr);

        return parsedIp.match(network, Number(prefix));
      })
    ) {
      return Result.fail({
        code: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP',
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
        let [addr, prefixLen]: string[] = prefix.split('/');

        let network: ipaddr.IPv4 | ipaddr.IPv6 = ipaddr.parse(addr);

        return parsedIp.match(network, Number(prefixLen));
      })
    ) {
      return Result.fail({
        code: 'BACKEND_API_HOST_IS_BLOCKED_BY_IP',
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

  return Result.succeed();
}
