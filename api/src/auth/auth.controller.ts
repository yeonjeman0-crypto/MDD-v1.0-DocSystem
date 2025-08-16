import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role?: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor() {}

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    // Simple mock login for now
    if (loginDto.username === 'admin' && loginDto.password === 'admin123') {
      return {
        access_token: 'mock-jwt-token',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@mdd.com',
          role: 'admin'
        }
      };
    }
    
    throw new Error('Invalid credentials');
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    // Simple mock registration
    return {
      message: 'User registered successfully',
      user: {
        id: Date.now().toString(),
        username: registerDto.username,
        email: registerDto.email,
        role: registerDto.role || 'user'
      }
    };
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    // Mock profile endpoint
    return {
      id: '1',
      username: 'admin',
      email: 'admin@mdd.com',
      role: 'admin'
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Authentication service health check' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'auth',
      timestamp: new Date().toISOString()
    };
  }
}