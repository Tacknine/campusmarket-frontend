import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof window === 'undefined') {
    return next(req);
  }
  const token = localStorage.getItem('campus_token');
  const userStr = localStorage.getItem('campus_user');
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id) {
        headers['X-User-Id'] = String(user.id);
      }
    } catch {}
  }

  if (Object.keys(headers).length > 0) {
    return next(req.clone({ setHeaders: headers }));
  }
  return next(req);
};
