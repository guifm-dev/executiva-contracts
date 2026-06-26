import { Module } from '@nestjs/common';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { TemplateService } from './template/template.service';
import { TemplateController } from './template/template.controller';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [HistoryModule],
  providers: [ContractService, TemplateService],
  controllers: [ContractController, TemplateController],
})
export class ContractModule {}
