import { IsInt, IsString } from 'class-validator';

export class AgentEventApi {
  @IsString()
  eventId: string;

  @IsInt()
  eventIndex: number;

  @IsString()
  sender: string;

  payload: any;
}
