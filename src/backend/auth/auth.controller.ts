import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthBody } from '../interfaces/AuthBodyInterface';
import { UserService } from '../user/user.service';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';

@Controller('/api/channels/v1.0/auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userServiceDB: UserService) {}

  @Post('/login')
  async login(@Body() body: AuthBody, @Req() req: Request, @Res() res: Response){
    const email = body?.email?.trim();
    const password = body?.password;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await this.userServiceDB.findByEmailWithPassword(email);
    if(!user){
      console.error("User not verified");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Regenerate session id on login to prevent session fixation attacks.
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => (err ? reject(err) : resolve()));
    });

    req.session.userId = String(user._id);
    req.session.sessionStartedAt = new Date().toISOString();
    req.session.chatHistory = [];
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => (err ? reject(err) : resolve()));
    });

    return res.json({ message: 'Logged in successfully' });
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res() res: Response){
    const userId = req.session.userId;
    const sessionId = req.sessionID;
    const sessionStartedAt =
      req.session.sessionStartedAt ?? new Date().toISOString();
    const chatHistory = req.session.chatHistory ?? [];

    // Persist the in-session chat history before destroying session.
    if (userId && chatHistory.length > 0) {
      await this.userServiceDB.saveSessionHistory({
        userId,
        sessionId,
        sessionStartedAt,
        sessionEndedAt: new Date().toISOString(),
        chatHistory,
      });
    }

    await new Promise<void>((resolve, reject) => {
      req.session.destroy((err) => (err ? reject(err) : resolve()));
    });
    res.clearCookie('sid');
    return res.json({ message: 'Logged out' });
  }

  @Get('/profile')
  async profile(@Req() req: Request, @Res() res: Response){
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    return res.status(200).json({userId: req.session.userId});
  }
}
