import { coreServices } from './core-services';
import { ConsumerService } from './services/consumer.service';

export const appServices = [...coreServices, ConsumerService];
