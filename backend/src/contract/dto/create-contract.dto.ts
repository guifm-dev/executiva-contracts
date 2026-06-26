import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FieldValueDto {
  name: string;
  value: string | null;
}

export class CreateContractDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValueDto)
  fields: FieldValueDto[];
}
