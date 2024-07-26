import { IsEmail, IsString, MinLength, MaxLength, IsArray } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    public name!: string;

    @IsEmail()
    public email!: string;

    @MinLength(10)
    @MaxLength(10)
    public phone!: number;

    @IsString()
    @MinLength(6)
    public password!: string;

    @IsArray()
    @IsString({ each: true })
    public interests!: string[];
}
