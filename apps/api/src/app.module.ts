import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { databaseModule, redisCacheModule } from './config/database.config';
import { GlobalModule } from './shared/global.module';
import { PatientModule } from './modules/patient/patient.module';
import { AuthModule } from './modules/auth/auth.module';
import { CasesModule } from './cases/cases.module';
import { InternalModule } from './internal/internal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    databaseModule,
    redisCacheModule,
    GlobalModule,
    PatientModule,
    AuthModule,
    CasesModule,
    InternalModule,
  ],
})
export class AppModule {}
