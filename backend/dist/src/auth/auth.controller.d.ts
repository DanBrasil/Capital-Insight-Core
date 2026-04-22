import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, tenantId: string): Promise<{
        token: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            tenantId: string;
        };
    }>;
    logout(): void;
    me(user: {
        id: string;
        tenantId: string;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        role: string;
        tenantId: string;
    }>;
}
