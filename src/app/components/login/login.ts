import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = signal<string>('');
  password = signal<string>('');
  rememberMe = signal<boolean>(false);

  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  usernameTouched = signal<boolean>(false);
  passwordTouched = signal<boolean>(false);
  toast = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  usernameError = computed(() => {
    if (!this.usernameTouched()) return '';
    const val = this.username().trim();
    if (!val) return 'Username is required';
    return '';
  });

  passwordError = computed(() => {
    if (!this.passwordTouched()) return '';
    const val = this.password();
    if (!val) return 'Password is required';
    if (val.length < 4) return 'Password must be at least 4 characters';
    return '';
  });

  isFormValid = computed(() => {
    return (
      this.username().trim().length > 0 &&
      this.password().length >= 4 &&
      !this.usernameError() &&
      !this.passwordError()
    );
  });

  onUsernameBlur() {
    this.usernameTouched.set(true);
  }

  onPasswordBlur() {
    this.passwordTouched.set(true);
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  toggleRememberMe() {
    this.rememberMe.update(v => !v);
  }

  onSubmit() {
    this.usernameTouched.set(true);
    this.passwordTouched.set(true);

    if (!this.isFormValid()) {
      this.showToast('Please enter your username and password', 'error');
      return;
    }

    this.isLoading.set(true);

    const username = this.username().trim();
    const password = this.password();

    this.authService.login({ username, password }).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.authService.saveAuth(response);
        const msg = response.message || 'Login successful! Redirecting...';
        this.showToast(msg, 'success');

        setTimeout(() => {
          this.router.navigate([this.authService.getDefaultDashboard()]);
        }, 1000);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errMsg = err.error?.message || err.error?.error || 'Login failed. Please check your username/password.';
        this.showToast(errMsg, 'error');
      }
    });
  }

  socialLogin(provider: string) {
    this.showToast(`${provider} auth service connecting to Gateway...`, 'success');
  }

  onForgotPassword() {
    this.showToast('Password reset instructions requested.', 'success');
  }

  showToast(text: string, type: 'success' | 'error') {
    this.toast.set({ text, type });
    setTimeout(() => {
      this.toast.set(null);
    }, 3800);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
