import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AuthGuard } from '../../shared/guards';
import { ChatbotService } from './chatbot.service';
import { ChatbotThrottlerGuard } from './chatbot-throttler.guard';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('chatbot')
@UseGuards(AuthGuard, ChatbotThrottlerGuard)
@Throttle({ chatbot: { limit: 10, ttl: 60_000 } })
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('message')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.chatbotService.streamMessage(dto.sessionId, dto.message, res);
  }

  @Delete('session/:sessionId')
  async deleteSession(
    @Param('sessionId', new ParseUUIDPipe()) sessionId: string,
  ): Promise<{ ok: true }> {
    return this.chatbotService.deleteSession(sessionId);
  }
}
