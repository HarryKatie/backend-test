import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { IUser, JWTPayload } from '@/types';
import { IAuthService } from '@/interfaces';
import { config } from '@/config';
import { UserModel } from '@/models/User';

export class AuthService implements IAuthService {
  generateToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
    };

    return jwt.sign(payload, config.jwt.secret); // ❌ no expiresIn here
  }

  // AuthService
  async generatePasswordResetToken(userId: string): Promise<string> {
    return jwt.sign(
      { userId },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  }


  async verifyToken(token: string): Promise<IUser | null> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;

      const user = await UserModel.findById(decoded.userId).select('-password');
      if (!user || !user.isActive) {
        return null;
      }

      return user.toJSON() as any;
    } catch (error) {
      return null;
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(config.security.bcryptRounds);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Additional utility methods
  generateRefreshToken(user: IUser): string {
    const payload = {
      userId: user._id,
      type: 'refresh',
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '30d', // 30 days
    });
  }

  verifyRefreshToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      if (decoded.type !== 'refresh') {
        return null;
      }
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  verifyPasswordResetToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      if (decoded.type !== 'password-reset') {
        return null;
      }
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }

  generateEmailVerificationToken(userId: string): string {
    const payload = {
      userId,
      type: 'email-verification',
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: '24h', // 24 hours
    });
  }

  verifyEmailVerificationToken(token: string): { userId: string } | null {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      if (decoded.type !== 'email-verification') {
        return null;
      }
      return { userId: decoded.userId };
    } catch (error) {
      return null;
    }
  }
} 