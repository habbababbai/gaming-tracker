import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class AuthThrottleGuard extends ThrottlerGuard {
  protected getTracker(req: Request): Promise<string> {
    // Use IP for public auth endpoints instead of route
    const ip = req.ip || (req.socket?.remoteAddress as string) || 'unknown';
    return Promise.resolve(ip);
  }
}
