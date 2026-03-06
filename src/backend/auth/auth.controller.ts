import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthBody } from '../interfaces/AuthBodyInterface';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
declare module 'express-session' {
  interface SessionData {
    userId: string;
  }
}

@Controller('/api/channels/v1.0/auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userServiceDB: UserService) {}

  @Post('/login')
  async login(@Body() body: AuthBody, @Req() req: Request, @Res() res: Response){
    const username = body.username;
    const email = body.email;
    const password = body.password;
    let user = await this.userServiceDB.findOne(email)
    if(!user){
      console.error("User not verified");
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    req.session.userId = email;
    await req.session.save();
    return res.json({ message: 'Logged in successfully' });
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response){
    req.session.destroy((err) => {
      if(err) console.error('Session destroy error:', err);
    });
    return res.json({ message: 'Logged out' });
  }

  @Get('/profile')
  async profile(@Req() req: Request, @Res() res: Response){
    return res.status(200).json({userId: req.session.userId});
  }
}
