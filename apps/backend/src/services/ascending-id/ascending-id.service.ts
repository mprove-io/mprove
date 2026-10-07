import { Injectable } from '@nestjs/common';
import { encodeId } from '#backend/services/ascending-id/encode-id/encode-id';

const HEX_RE = /^[a-z]+_([0-9a-f]{12})/;

@Injectable()
export class AscendingIdService {
  private lastTimestamp = 0;

  private counter = 0;

  makeAscendingId(item: { prefix: string }): string {
    let { prefix } = item;

    let now: number = Date.now();

    if (now > this.lastTimestamp) {
      this.lastTimestamp = now;

      this.counter = 0;
    }

    this.counter++;

    let encoded: bigint =
      BigInt(this.lastTimestamp) * BigInt(0x1000) + BigInt(this.counter);

    this.lastTimestamp = Number(encoded / BigInt(0x1000));

    this.counter = Number(encoded % BigInt(0x1000));

    let encodedId: string = encodeId({ encoded: encoded });

    let result: string = prefix + '_' + encodedId;

    return result;
  }

  makeAscendingIdAfter(item: { prefix: string; afterId: string }): string {
    let { prefix, afterId } = item;

    let match: ReturnType<RegExp['exec']> = HEX_RE.exec(afterId);

    if (!match) {
      let result: string = this.makeAscendingId({ prefix: prefix });

      return result;
    }

    let afterEncoded: bigint = BigInt('0x' + match[1]);

    let now: number = Date.now();

    if (now > this.lastTimestamp) {
      this.lastTimestamp = now;

      this.counter = 0;
    }

    this.counter++;

    let nowEncoded: bigint =
      BigInt(this.lastTimestamp) * BigInt(0x1000) + BigInt(this.counter);

    let chosen: bigint =
      afterEncoded >= nowEncoded ? afterEncoded + BigInt(1) : nowEncoded;

    // Keep subsequent allocations above this value, even before the wall clock
    // catches up with a future afterId or an overflowed counter.
    this.lastTimestamp = Number(chosen / BigInt(0x1000));

    this.counter = Number(chosen % BigInt(0x1000));

    let encodedId: string = encodeId({ encoded: chosen });

    let result: string = prefix + '_' + encodedId;

    return result;
  }
}
