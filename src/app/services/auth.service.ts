import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  fullName: string;
  roles: string[];
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthApiResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private get baseUrl(): string {
    if (typeof window !== 'undefined' && window.location.port === '4200') {
      return '';
    }
    return 'http://localhost:8080';
  }

  constructor(private http: HttpClient) {}

  register(payload: RegisterPayload): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<AuthApiResponse> {
    return this.http.post<AuthApiResponse>(`${this.baseUrl}/api/auth/login`, payload);
  }

  saveAuth(res: AuthApiResponse) {
    if (res && res.data) {
      const data = res.data;
      if (data.accessToken) {
        localStorage.setItem('campus_token', data.accessToken);
        localStorage.setItem('campus_token_type', data.tokenType || 'Bearer');
      }
      if (data.refreshToken) {
        localStorage.setItem('campus_refresh_token', data.refreshToken);
      }
      localStorage.setItem('campus_user', JSON.stringify({
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles
      }));
    }
  }

  getToken(): string | null {
    return localStorage.getItem('campus_token');
  }

  getUser(): any {
    const u = localStorage.getItem('campus_user');
    return u ? JSON.parse(u) : null;
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.roles?.includes(role) || false;
  }

  hasAnyRole(roles: string[]): boolean {
    const user = this.getUser();
    if (!user?.roles) return false;
    return roles.some(r => user.roles.includes(r));
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getDefaultDashboard(): string {
    if (this.hasRole('ROLE_ADMIN')) return '/dashboard/stats';
    if (this.hasRole('ROLE_SELLER')) return '/dashboard/products';
    return '/dashboard/orders';
  }

  logout() {
    localStorage.removeItem('campus_token');
    localStorage.removeItem('campus_token_type');
    localStorage.removeItem('campus_refresh_token');
    localStorage.removeItem('campus_user');
  }
}
