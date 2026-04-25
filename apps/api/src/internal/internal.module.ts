import { Module } from '@nestjs/common';
import { InternalController } from './internal.controller';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [CasesModule],
  controllers: [InternalController],
})
export class InternalModule {}
