import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthBody } from '../interfaces/AuthBodyInterface';
@Controller('/api/channels/v1.0/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() body: AuthBody, @Req() req: Request, @Res() res: Response){
    
  }
}
