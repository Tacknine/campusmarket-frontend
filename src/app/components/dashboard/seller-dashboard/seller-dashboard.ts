import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.scss',
})
export class SellerDashboard implements OnInit {
  activeTab = signal<'products' | 'orders'>('products');

  products = signal<any[]>([]);
  categories = signal<any[]>([]);
  orders = signal<any[]>([]);

  loading = signal(true);
  ordersLoading = signal(true);
  error = signal<string | null>(null);
  ordersError = signal<string | null>(null);

  showModal = signal(false);
  editingProduct = signal<any>(null);
  saving = signal(false);
  processingOrderId = signal<number | null>(null);
  toast = signal<string | null>(null);

  productForm = {
    name: '',
    description: '',
    price: 0,
    stockQuantity: 1,
    categoryId: 0
  };

  private baseUrl = `${environment.apiBaseUrl}/api/products`;
  private catUrl = `${environment.apiBaseUrl}/api/categories`;
  private ordersUrl = `${environment.apiBaseUrl}/api/orders`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadOrders();
  }

  setTab(tab: 'products' | 'orders') {
    this.activeTab.set(tab);
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<any>(this.baseUrl).subscribe({
      next: (res) => {
        const data = res.data || res;
        this.products.set(Array.isArray(data) ? data : []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load products.');
        this.loading.set(false);
      }
    });
  }

  loadCategories() {
    this.http.get<any>(this.catUrl).subscribe({
      next: (res) => {
        const data = res.data || res;
        this.categories.set(Array.isArray(data) ? data : []);
      },
      error: () => {}
    });
  }

  loadOrders() {
    this.ordersLoading.set(true);
    this.ordersError.set(null);
    this.http.get<any>(`${this.ordersUrl}/seller`).subscribe({
      next: (res) => {
        const data = res.data || res;
        this.orders.set(Array.isArray(data) ? data : []);
        this.ordersLoading.set(false);
      },
      error: (err) => {
        this.ordersError.set(err.error?.message || 'Failed to load orders.');
        this.ordersLoading.set(false);
      }
    });
  }

  acceptOrder(order: any) {
    this.processingOrderId.set(order.id);
    this.http.post<any>(`${this.ordersUrl}/${order.id}/accept`, {}).subscribe({
      next: () => {
        this.processingOrderId.set(null);
        this.showToast(`Order #${order.id} accepted!`);
        this.loadOrders();
      },
      error: (err) => {
        this.processingOrderId.set(null);
        this.showToast(err.error?.message || 'Failed to accept order.');
      }
    });
  }

  rejectOrder(order: any) {
    if (!confirm(`Reject order #${order.id}?`)) return;
    this.processingOrderId.set(order.id);
    this.http.post<any>(`${this.ordersUrl}/${order.id}/reject`, {}).subscribe({
      next: () => {
        this.processingOrderId.set(null);
        this.showToast(`Order #${order.id} rejected.`);
        this.loadOrders();
      },
      error: (err) => {
        this.processingOrderId.set(null);
        this.showToast(err.error?.message || 'Failed to reject order.');
      }
    });
  }

  openAddModal() {
    this.editingProduct.set(null);
    this.productForm = { name: '', description: '', price: 0, stockQuantity: 1, categoryId: 0 };
    this.showModal.set(true);
  }

  openEditModal(product: any) {
    this.editingProduct.set(product);
    this.productForm = {
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      stockQuantity: product.stockQuantity || 1,
      categoryId: product.categoryId || 0
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }

  saveProduct() {
    this.saving.set(true);
    const payload = { ...this.productForm };
    const request = this.editingProduct()
      ? this.http.put<any>(`${this.baseUrl}/${this.editingProduct().id}`, payload)
      : this.http.post<any>(this.baseUrl, payload);

    request.subscribe({
      next: () => {
        this.showToast(this.editingProduct() ? 'Product updated!' : 'Product created!');
        this.closeModal();
        this.loadProducts();
        this.saving.set(false);
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to save product.');
        this.saving.set(false);
      }
    });
  }

  deleteProduct(id: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.http.delete<any>(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.showToast('Product deleted.');
        this.loadProducts();
      },
      error: (err) => {
        this.showToast(err.error?.message || 'Failed to delete product.');
      }
    });
  }

  getPendingOrders(): number {
    return this.orders().filter(o => this.isPendingOrder(o)).length;
  }

  isPendingOrder(order: any): boolean {
    const status = (order?.status || 'PENDING').toUpperCase();
    return !['ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED', 'DELIVERED', 'SHIPPED'].includes(status);
  }

  getOrderProducts(order: any): string {
    if (Array.isArray(order.items) && order.items.length) {
      return order.items.map((i: any) => `${i.productName || i.name || 'Product'}${i.quantity ? ` x${i.quantity}` : ''}`).join(', ');
    }
    return order.productName || order.name || 'Product';
  }

  getOrderQuantity(order: any): number {
    if (Array.isArray(order.items) && order.items.length) {
      return order.items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0);
    }
    return order.quantity || 1;
  }

  getOrderBuyer(order: any): string {
    return order.buyerName || order.buyer?.fullName || order.buyer?.username || order.username || 'Buyer';
  }

  getTotalStock(): number {
    return this.products().reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  }

  getTotalValue(): number {
    return this.products().reduce((sum, p) => sum + (p.price || 0) * (p.stockQuantity || 0), 0);
  }

  formatPrice(price: number): string {
    return `TZS ${(price || 0).toLocaleString()}`;
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(null), 3000);
  }
}
