import { ProcessMessageService } from './controllers/process-message/process-message.service';
import { ConsumerService } from './services/consumer.service';
import { MessageService } from './services/message.service';

export const appServices = [
  ConsumerService,
  MessageService,

  ProcessMessageService
];
