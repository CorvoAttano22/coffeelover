import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh.token.dto';
import { Response } from 'express';
import { ConfigType } from '@nestjs/config';
import jwtConfig from '../config/jwt.config';
@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    await this.authService.signUp(signUpDto);
    return { message: 'Sign-up successful' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signIn(signInDto);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      //just placeholder for env stat
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.jwtConfiguration.accessTokenTtl * 1000, // 15 min
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      //just placeholder for env stat
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: this.jwtConfiguration.refreshTokenTtl * 1000, // 86400 * 1000 = 1d
    });

    return {
      message: 'Sign-in successful',
      ...tokens,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
