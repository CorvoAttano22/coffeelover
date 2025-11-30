import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from './access-token.guard';
import { AuthType } from 'src/iam/enums/auth-type.enum';
import { AUTH_TYPE_KEY } from 'src/iam/decorators/auth.decorator';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AuthType.None;

  private readonly authTypeGuardMap: Record<
    AuthType,
    | CanActivate
    | CanActivate[]
    | { canActivate: (context: ExecutionContext) => Promise<boolean> }
  >;

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.None]: {
        canActivate: async (context: ExecutionContext) => {
          try {
            await this.accessTokenGuard.canActivate(context);
          } catch (err) {
            // This route is public, so we just proceed as a guest.
          }
          return true;
        },
      },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AuthType[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];

    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
    let error = new UnauthorizedException();

    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        error = err;
      });

      if (canActivate) {
        return true;
      }
    }
    throw error;
  }
}
