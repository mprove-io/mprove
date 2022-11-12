import { Body, Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { interfaces } from '~disk/barrels/interfaces';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { SaveFileService } from './save-file.service';

@Controller()
export class SaveFileController {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private saveFileService: SaveFileService,
    private pinoLogger: PinoLogger
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskSaveFile)
  async saveFile(@Body() body: any) {
    try {
      let payload = await this.saveFileService.process(body);

      return makeOkResponseDisk({
        payload: payload,
        body: body,
        cs: this.cs,
        pinoLogger: this.pinoLogger
      });
    } catch (e) {
      return makeErrorResponseDisk({
        e: e,
        body: body,
        cs: this.cs,
        pinoLogger: this.pinoLogger
      });
    }
  }
}
