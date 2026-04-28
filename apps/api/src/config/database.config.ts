import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

export const databaseModule = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres' as const,
    url: configService.get<string>('database.url'),
    synchronize: configService.get<boolean>('database.synchronize') ?? false,
    autoLoadEntities: true,
  }),
  inject: [ConfigService],
});

export const redisCacheModule = CacheModule.registerAsync({
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const url = configService.get<string>('redis.url');
    return {
      stores: [createKeyv(url)],
    };
  },
  inject: [ConfigService],
});
