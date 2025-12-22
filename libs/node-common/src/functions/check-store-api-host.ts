import { promises as dns, LookupAddress } from 'dns';
import * as net from 'net';

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

// Docker special hosts
let BLOCKED_SPECIAL_HOSTS: readonly string[] = [
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

export async function checkStoreApiHost(item: {
  urlStr: string;
}) {
  let { urlStr } = item;

  let hostname: string;

  try {
    let url: URL = new URL(urlStr);
    hostname = url.hostname;
  } catch (e) {
    // console.log(e);

    throw new Error(`Invalid URL - ${urlStr}`);
  }

  let cleanHost: string = hostname.toLowerCase();

  if (BLOCKED_SPECIAL_HOSTS.includes(cleanHost)) {
    throw new Error(`Host blocked - special hosts: ${hostname}`);
  }

  if (
    INTERNAL_DOMAIN_SUFFIXES.some((s: string): boolean => cleanHost.endsWith(s))
  ) {
    throw new Error(`Host blocked - suffix: ${hostname}`);
  }

  if (net.isIPv4(cleanHost)) {
    customCheckIPv4({ cleanHost: cleanHost, tag: 'instant' });
  }

  if (net.isIPv6(cleanHost)) {
    customCheckIPv6({ cleanHost: cleanHost, tag: 'instant' });
  }

  libsCheckIP({ cleanHost: cleanHost, tag: 'instant' });

  let records: LookupAddress[] = await dns.lookup(cleanHost, { all: true });

  for (let r of records) {
    if (r.family === 4) {
      customCheckIPv4({ cleanHost: r.address, tag: 'resolved' });
    }

    if (r.family === 6) {
      customCheckIPv6({ cleanHost: r.address, tag: 'resolved' });
    }

    libsCheckIP({ cleanHost: r.address, tag: 'resolved' });
  }
}

function libsCheckIP(item: { cleanHost: string; tag: string }) {
  let { cleanHost, tag } = item;

  if (ip.isPrivate(cleanHost)) {
    throw new Error(`Host blocked - libIp - ${tag}: ${cleanHost}`);
  }

  if (neoip.isPrivate(cleanHost)) {
    throw new Error(`Host blocked - libNeo - ${tag}: ${cleanHost}`);
  }
}

function customCheckIPv4(item: { cleanHost: string; tag: string }) {
  let { cleanHost, tag } = item;

  if (isNonPublicIPv4Custom(cleanHost)) {
    throw new Error(`Host blocked - custom IPv4 - ${tag}: ${cleanHost}`);
  }
}

function customCheckIPv6(item: { cleanHost: string; tag: string }) {
  let { cleanHost, tag } = item;

  if (isNonGlobalIPv6Custom(cleanHost)) {
    throw new Error(`Host blocked - custom IPv6 - ${tag}: ${cleanHost}`);
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
