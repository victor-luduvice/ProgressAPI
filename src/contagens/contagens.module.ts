import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContagensController } from './contagens.controller';
import { ContagensService } from './contagens.service';

@Module({
  imports: [AuthModule],
  controllers: [ContagensController],
  providers: [ContagensService],
})
export class ContagensModule {}
