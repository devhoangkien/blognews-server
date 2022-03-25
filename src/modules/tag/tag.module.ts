import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagProvider } from '@app/models/tag.model';


@Module({
  imports: [],
  controllers: [TagController],
  providers: [TagProvider],
  exports: [],
})
export class TagModule { }
