import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @Length(1, 255)
  title!: string;

  @IsEnum(['income', 'expense'])
  type!: 'income' | 'expense';

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsString()
  @Length(1, 100)
  category!: string;

  @IsDateString()
  date!: string;

  @IsEnum(['completed', 'pending', 'cancelled'])
  status!: 'completed' | 'pending' | 'cancelled';

  @IsOptional()
  @IsString()
  description?: string;
}
