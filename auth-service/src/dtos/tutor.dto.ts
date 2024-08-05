import { IsEmail, IsString, MinLength, Length } from 'class-validator';

export class CreateTutorDto {
    @IsString()
    public name!: string;

    @IsEmail()
    public email!: string;

    @Length(10, 10)
    public phone!: number;

    @IsString()
    @MinLength(6)
    public password!: string;

    @IsString()
    @MinLength(6)
    public confirmPassword!: string;

    public role!: 'student' | 'tutor' | 'admin';
}
