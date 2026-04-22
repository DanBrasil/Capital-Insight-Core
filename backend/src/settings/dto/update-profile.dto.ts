import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['pt-BR', 'en-US'])
  locale?: 'pt-BR' | 'en-US';

  @IsOptional()
  @IsEnum(['BRL', 'USD', 'EUR'])
  currency?: 'BRL' | 'USD' | 'EUR';
}
