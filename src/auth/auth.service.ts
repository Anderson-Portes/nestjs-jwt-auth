import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
    ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(pass, user.password);

    if(!isValidPassword) {
      return;
    }

    return user;
  }

  async login(user: any) {
    const payload = { email: user.email , username: user.name, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}