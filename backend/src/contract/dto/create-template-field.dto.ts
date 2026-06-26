import {
  IsString,
  IsEnum,
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';
import { FieldType } from '@prisma/client';

export class CreateTemplateFieldDto {
  @IsString()
  name: string;

  @IsEnum(FieldType)
  type: FieldType;

  @IsBoolean()
  @IsOptional()
  required?: boolean = false;

  @IsInt()
  @IsOptional()
  order?: number = 0;
}
