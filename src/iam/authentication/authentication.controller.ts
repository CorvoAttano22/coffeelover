import {
  Body,
  Controller,
  Get,
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
import { ActiveUser } from '../decorators/active-user.decorator';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { ApiBearerAuth } from '@nestjs/swagger';
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

    //using local storage instead for bearer token
    // res.cookie('accessToken', tokens.accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'lax',
    //   maxAge: this.jwtConfiguration.accessTokenTtl * 1000, // 15 min
    // });

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

  @ApiBearerAuth()
  @Auth(AuthType.Bearer)
  @Post('logout')
  async logout(
    @ActiveUser() user: ActiveUserData,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(user);

    response.clearCookie('refreshToken', {
      httpOnly: true,
      //just placeholder for env stat
      secure: process.env.NODE_ENV === 'production',
    });
  }
  
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @ApiBearerAuth()
  @Auth(AuthType.Bearer)
  @Get('me')
  getProfile(@ActiveUser() user: ActiveUserData) {
    return user;
  }
}
