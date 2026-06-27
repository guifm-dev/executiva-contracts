import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FieldValueDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  value: string | null;
}

export class CreateContractDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldValueDto)
  fields: FieldValueDto[];
}
