import { IsEmail, IsString, MinLength, IsArray, Length } from 'class-validator';

export class CreateStudentDto {
    @IsString()
    public name!: string;

    @IsEmail()
    public email!: string;

    @Length(10,10)
    public phone!: number;

    @IsString()
    @MinLength(6)
    public password!: string;

    @IsString()
    @MinLength(6)
    public confirmPassword!: string;

    @IsArray()
    @IsString({ each: true })
    public interests!: string[];

    public role!: 'student' | 'tutor' | 'admin';
}

export interface VerifyOtpDto {
    email: string;
    otp: string;
  }