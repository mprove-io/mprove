import { promises as dns, LookupAddress } from 'dns';
import * as net from 'net';
import { ErEnum } from '~common/enums/er.enum';
import { ServerError } from '~common/models/server-error';

let ip = require('ip'); // npm install ip – extra redundant check (safe due to strict parsing)
let neoip = require('neoip');

// Non-public IPv4 CIDRs (IANA special-purpose)
let NON_PUBLIC_IPV4_CIDRS: readonly string[] = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8', // Loopback — comment out if you allow localhost/sidecars
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
  '::1/', // Loopback
  '::ffff:0:0/', // IPv4-mapped
  'fc00::/', // Unique Local (ULA)
  'fe80::/' // Link-local
];

// Docker hosts
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

export async function checkStoreApiHostname(item: {
  hostname: string;
}) {
  let { hostname } = item;

  if (BLOCKED_SPEC_HOSTS.includes(hostname)) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_SPEC,
      displayData: { hostname: hostname }
    });
  }

  if (
    INTERNAL_DOMAIN_SUFFIXES.some((s: string): boolean => hostname.endsWith(s))
  ) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_SUFFIX,
      displayData: { hostname: hostname }
    });
  }

  if (net.isIPv4(hostname)) {
    customCheckIPv4({ hostname: hostname, tag: 'instant' });
  }

  if (net.isIPv6(hostname)) {
    customCheckIPv6({ hostname: hostname, tag: 'instant' });
  }

  libsCheckIP({ hostname: hostname, tag: 'instant' });

  let records: LookupAddress[] = await dns.lookup(hostname, { all: true });

  for (let r of records) {
    if (r.family === 4) {
      customCheckIPv4({ hostname: r.address, tag: 'resolved' });
    }

    if (r.family === 6) {
      customCheckIPv6({ hostname: r.address, tag: 'resolved' });
    }

    libsCheckIP({ hostname: r.address, tag: 'resolved' });
  }
}

function libsCheckIP(item: { hostname: string; tag: string }) {
  let { hostname, tag } = item;

  if (ip.isPrivate(hostname)) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_IP,
      displayData: { hostname: hostname },
      customData: { tag: tag, lib: 'ip' }
    });
  }

  if (neoip.isPrivate(hostname)) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_IP,
      displayData: { hostname: hostname },
      customData: { tag: tag, lib: 'neoip' }
    });
  }
}

function customCheckIPv4(item: { hostname: string; tag: string }) {
  let { hostname, tag } = item;

  if (isNonPublicIPv4Custom(hostname)) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_IP,
      displayData: { hostname: hostname },
      customData: { tag: tag, lib: 'custom  IPv4' }
    });
  }
}

function customCheckIPv6(item: { hostname: string; tag: string }) {
  let { hostname, tag } = item;

  if (isNonGlobalIPv6Custom(hostname)) {
    throw new ServerError({
      message: ErEnum.BACKEND_STORE_API_HOST_IS_BLOCKED_BY_IP,
      displayData: { hostname: hostname },
      customData: { tag: tag, lib: 'custom IPv6' }
    });
  }
}

function parseIPv4Strict(ip: string): number | null {
  let parts: string[] = ip.split('.');
  if (parts.length !== 4) return null;

  let result: number = 0;
  for (let part of parts) {
    let n: number = parseInt(part, 10);
    if (isNaN(n) || n < 0 || n > 255 || part !== n.toString(10)) {
      return null; // Blocks octal/hex/leading zeros/malformed
    }
    result = result * 256 + n;
  }
  return result;
}

function isNonPublicIPv4Custom(ip: string): boolean {
  let num: number | null = parseIPv4Strict(ip);
  if (num === null) return true; // Invalid → block

  return NON_PUBLIC_IPV4_CIDRS.some((cidr: string): boolean => {
    let [netStr, prefixStr] = cidr.split('/');
    let prefix: number = parseInt(prefixStr, 10);
    let netNum: number | null = parseIPv4Strict(netStr);
    if (netNum === null) return false;

    let mask: number =
      prefix === 0 ? 0 : 0xffffffff - (Math.pow(2, 32 - prefix) - 1);
    return (num & mask) === netNum;
  });
}

function isNonGlobalIPv6Custom(ip: string): boolean {
  let normalized: string = ip.toLowerCase();
  return NON_GLOBAL_IPV6_PREFIXES.some((prefix: string): boolean =>
    normalized.startsWith(prefix)
  );
}
