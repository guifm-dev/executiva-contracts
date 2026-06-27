import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFieldValueDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  value: string | null;
}

export class UpdateContractFieldsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFieldValueDto)
  fields: UpdateFieldValueDto[];
}
