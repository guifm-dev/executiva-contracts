import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  tenantName: string;

  @IsString()
  adminName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  @MinLength(6)
  adminPassword: string;
}
