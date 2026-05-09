import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { databaseModule, redisCacheModule } from './config/database.config';
import { GlobalModule } from './shared/global.module';
import { PatientModule } from './modules/patient/patient.module';
import { AuthModule } from './modules/auth/auth.module';
import { CasesModule } from './modules/cases/cases.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { InternalModule } from './internal/internal.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([
      { name: 'chatbot', ttl: 60_000, limit: 10 },
    ]),
    databaseModule,
    redisCacheModule,
    GlobalModule,
    PatientModule,
    AuthModule,
    CasesModule,
    ChatbotModule,
    InternalModule,
  ],
})
export class AppModule {}
