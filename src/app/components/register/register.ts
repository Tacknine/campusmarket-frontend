import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type UserRole = 'ROLE_USER' | 'ROLE_SELLER';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  fullName = signal('');
  username = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  acceptedTerms = signal(false);
  isLoading = signal(false);
  toast = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  // Role selection: buyer, seller, or both
  selectedRole = signal<'BUYER' | 'SELLER' | 'BOTH'>('BUYER');

  private readonly EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  fullNameError = computed(() => {
    const val = this.fullName().trim();
    if (!val) return '';
    if (val.length < 2) return 'Full name must be at least 2 characters';
    if (!/^[A-Za-z][A-Za-z' -]*$/.test(val)) return 'Please use letters only';
    return '';
  });

  usernameError = computed(() => {
    const val = this.username().trim();
    if (!val) return '';
    if (val.length < 3) return 'Username must be at least 3 characters';
    if (!/^[A-Za-z0-9_.-]+$/.test(val)) return 'Letters, numbers, . _ - only';
    return '';
  });

  emailError = computed(() => {
    const val = this.email().trim();
    if (!val) return '';
    if (!this.EMAIL_RE.test(val)) return 'Enter a valid email address';
    return '';
  });

  passwordError = computed(() => {
    const val = this.password();
    if (!val) return '';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  });

  passwordStrength = computed(() => {
    const val = this.password();
    let score = 0;
    if (!val) return { score: 0, label: '', color: '#e2e8f0' };
    if (val.length >= 6) score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    score = Math.min(4, score);
    const labels = ['Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#dc2626', '#f59e0b', '#0ea5e9', '#16a34a'];
    return { score, label: labels[score - 1] || '', color: score > 0 ? colors[score - 1] : '#e2e8f0' };
  });

  confirmError = computed(() => {
    if (!this.confirmPassword()) return '';
    if (this.password() !== this.confirmPassword()) return 'Passwords do not match';
    return '';
  });

  isFormValid = computed(() => {
    return (
      this.fullName().trim().length >= 2 &&
      this.username().trim().length >= 3 &&
      this.EMAIL_RE.test(this.email().trim()) &&
      this.password().length >= 6 &&
      this.password() === this.confirmPassword() &&
      this.acceptedTerms()
    );
  });

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.update(v => !v);
  }

  selectRole(role: 'BUYER' | 'SELLER' | 'BOTH') {
    this.selectedRole.set(role);
  }

  private buildRoles(): UserRole[] {
    const role = this.selectedRole();
    if (role === 'SELLER') return ['ROLE_SELLER'];
    if (role === 'BOTH') return ['ROLE_USER', 'ROLE_SELLER'];
    return ['ROLE_USER'];
  }

  onSubmit() {
    if (!this.isFormValid()) {
      this.showToast('Please fill in all fields correctly and accept the terms.', 'error');
      return;
    }
    if (this.password() !== this.confirmPassword()) {
      this.showToast('Passwords do not match.', 'error');
      return;
    }

    this.isLoading.set(true);

    this.authService.register({
      fullName: this.fullName().trim(),
      username: this.username().trim(),
      email: this.email().trim(),
      password: this.password(),
      roles: this.buildRoles()
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showToast('Account created! Redirecting to login...', 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || err.error?.error || 'Registration failed. Username or email may already exist.';
        this.showToast(msg, 'error');
      }
    });
  }

  showToast(text: string, type: 'success' | 'error') {
    this.toast.set({ text, type });
    setTimeout(() => this.toast.set(null), 3800);
  }
}
