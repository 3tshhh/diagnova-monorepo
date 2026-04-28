import { Module } from '@nestjs/common';
import { InternalController } from './internal.controller';
import { CasesModule } from '../modules/cases/cases.module';

@Module({
  imports: [CasesModule],
  controllers: [InternalController],
})
export class InternalModule {}
