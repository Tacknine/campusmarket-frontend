import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  activeTab = signal<'stats' | 'users' | 'categories'>('stats');
  users = signal<any[]>([]);
  categories = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  toast = signal<string | null>(null);

  showCategoryModal = signal(false);
  editingCategory = signal<any>(null);
  saving = signal(false);

  categoryForm = { name: '', description: '' };

  private apiBase = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadAll();
  }

  setTab(tab: 'stats' | 'users' | 'categories') {
    this.activeTab.set(tab);
  }

  loadAll() {
    this.loading.set(true);
    this.error.set(null);
    Promise.all([
      this.loadUsers(),
      this.loadCategories()
    ]).finally(() => this.loading.set(false));
  }

  loadUsers(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any>(`${this.apiBase}/api/users`).subscribe({
        next: (res) => {
          const data = res.data || res;
          this.users.set(Array.isArray(data) ? data : []);
          resolve();
        },
        error: () => { this.users.set([]); resolve(); }
      });
    });
  }

  loadCategories(): Promise<void> {
    return new Promise((resolve) => {
      this.http.get<any>(`${this.apiBase}/api/categories`).subscribe({
        next: (res) => {
          const data = res.data || res;
          this.categories.set(Array.isArray(data) ? data : []);
          resolve();
        },
        error: () => { this.categories.set([]); resolve(); }
      });
    });
  }

  deleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.http.delete<any>(`${this.apiBase}/api/users/${id}`).subscribe({
      next: () => { this.showToast('User deleted.'); this.loadUsers(); },
      error: (err) => { this.showToast(err.error?.message || 'Failed to delete user.'); }
    });
  }

  openCategoryModal(category?: any) {
    if (category) {
      this.editingCategory.set(category);
      this.categoryForm = { name: category.name || '', description: category.description || '' };
    } else {
      this.editingCategory.set(null);
      this.categoryForm = { name: '', description: '' };
    }
    this.showCategoryModal.set(true);
  }

  closeCategoryModal() {
    this.showCategoryModal.set(false);
    this.editingCategory.set(null);
  }

  saveCategory() {
    this.saving.set(true);
    const payload = { ...this.categoryForm };
    const request = this.editingCategory()
      ? this.http.put<any>(`${this.apiBase}/api/categories/${this.editingCategory().id}`, payload)
      : this.http.post<any>(`${this.apiBase}/api/categories`, payload);

    request.subscribe({
      next: () => {
        this.showToast(this.editingCategory() ? 'Category updated!' : 'Category created!');
        this.closeCategoryModal();
        this.loadCategories();
        this.saving.set(false);
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to save category.');
        this.saving.set(false);
      }
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.http.delete<any>(`${this.apiBase}/api/categories/${id}`).subscribe({
      next: () => { this.showToast('Category deleted.'); this.loadCategories(); },
      error: (err) => { this.showToast(err.error?.message || 'Failed to delete category.'); }
    });
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3000);
  }
}
