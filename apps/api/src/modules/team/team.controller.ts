import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { TeamService } from './team.service';

@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('avatar/:username')
  async getAvatar(
    @Param('username') username: string,
    @Res() res: Response,
  ): Promise<void> {
    const { buffer, contentType } = await this.teamService.getAvatar(username);
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(buffer);
  }
}
