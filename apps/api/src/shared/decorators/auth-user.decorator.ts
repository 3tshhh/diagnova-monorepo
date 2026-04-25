import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentPatient = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.loggedInPatient?.patient;
});

export const logoutJti = createParamDecorator((data, ctx: ExecutionContext) => {
  const { jti, exp } = ctx.switchToHttp().getRequest().loggedInPatient.verifiedToken;
  return { jti, exp };
});

export const refreshToken = createParamDecorator((data, ctx: ExecutionContext) => {
  const { jti, patientId, email, exp } = ctx.switchToHttp().getRequest()
    .loggedInPatient
    .verifiedToken;
  return { jti, patientId, email, exp };
});
