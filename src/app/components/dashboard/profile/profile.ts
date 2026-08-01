import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  user = signal<any>(null);
  isEditing = signal(false);
  saving = signal(false);
  toast = signal<string | null>(null);

  editForm = {
    fullName: '',
    email: '',
    username: ''
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.user.set(this.authService.getUser());
    const u = this.user();
    if (u) {
      this.editForm.fullName = u.fullName || u.username || '';
      this.editForm.email = u.email || '';
      this.editForm.username = u.username || '';
    }
  }

  toggleEdit() {
    this.isEditing.update(v => !v);
    if (!this.isEditing()) {
      const u = this.user();
      this.editForm.fullName = u.fullName || u.username || '';
      this.editForm.email = u.email || '';
      this.editForm.username = u.username || '';
    }
  }

  save() {
    this.saving.set(true);
    setTimeout(() => {
      const u = this.user();
      u.fullName = this.editForm.fullName;
      u.email = this.editForm.email;
      u.username = this.editForm.username;
      localStorage.setItem('campus_user', JSON.stringify(u));
      this.user.set({ ...u });
      this.isEditing.set(false);
      this.saving.set(false);
      this.showToast('Profile updated successfully!');
    }, 800);
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3000);
  }

  getRoleLabel(): string {
    const roles = this.user()?.roles || [];
    if (roles.includes('ROLE_ADMIN')) return 'Administrator';
    if (roles.includes('ROLE_SELLER')) return 'Seller';
    return 'Student';
  }
}
