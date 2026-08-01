import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { PaymentService, PaymentResponse } from '../../../services/payment.service';
import { TrackingService, DeliveryResponse } from '../../../services/tracking.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth.service';
import { OrderResponse } from '../../../models/order.model';
import { Product, mapProductResponseToProduct } from '../../../models/product.model';
import { Category, mapCategoryResponseToCategory } from '../../../models/category.model';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss',
})
export class UserDashboard implements OnInit {
  activeTab = signal<'products' | 'categories' | 'orders' | 'payments' | 'tracking'>('products');

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  orders = signal<OrderResponse[]>([]);
  payments = signal<PaymentResponse[]>([]);
  deliveries = signal<DeliveryResponse[]>([]);

  searchQuery = signal('');
  selectedCategoryId = signal<string | null>(null);
  loading = signal(false);
  paying = signal<number | null>(null);
  trackingOrderId = signal<number | null>(null);
  error = signal<string | null>(null);

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private paymentService: PaymentService,
    private trackingService: TrackingService,
    private toast: ToastService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
    this.loadOrders();
    this.loadPayments();
  }

  setTab(tab: 'products' | 'categories' | 'orders' | 'payments' | 'tracking') {
    this.activeTab.set(tab);
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => this.products.set(data.map(mapProductResponseToProduct)),
      error: () => {}
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data) => this.categories.set(data.map(mapCategoryResponseToCategory)),
      error: () => {}
    });
  }

  loadOrders() {
    this.orderService.getBuyerOrders().subscribe({
      next: (data) => this.orders.set(data),
      error: () => {}
    });
  }

  loadPayments() {
    this.paymentService.getBuyerPayments().subscribe({
      next: (data) => this.payments.set(data),
      error: () => {}
    });
  }

  loadTracking(orderId: number) {
    this.trackingOrderId.set(orderId);
    this.trackingService.getDeliveryByOrderId(orderId).subscribe({
      next: (data) => {
        const existing = this.deliveries().filter(d => d.orderId !== orderId);
        this.deliveries.set([...existing, data]);
      },
      error: () => {
        this.toast.info('No tracking info available for this order yet.');
      }
    });
  }

  get filteredProducts() {
    return this.products().filter(p => {
      const matchesSearch = !this.searchQuery() ||
        p.name.toLowerCase().includes(this.searchQuery().toLowerCase());
      const selectedCat = this.selectedCategoryId();
      const matchesCategory = !selectedCat ||
        p.category.toLowerCase() === selectedCat;
      return matchesSearch && matchesCategory;
    });
  }

  selectCategory(catId: string | null) {
    this.selectedCategoryId.set(catId);
  }

  payNow(orderId: number) {
    this.paying.set(orderId);
    this.router.navigate(['/checkout'], { queryParams: { payOrderId: orderId } });
  }

  get totalOrders() {
    return this.orders().length;
  }

  get totalSpent() {
    return this.orders().reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  }

  get pendingOrders() {
    return this.orders().filter(o =>
      ['CREATED', 'ACCEPTED'].includes(o.status?.toUpperCase() || '')
    ).length;
  }

  isOrderPaid(orderId: number): boolean {
    const p = this.payments().find(pmt => pmt.orderId === orderId);
    return !!p && p.status === 'COMPLETED';
  }

  canPayOrder(order: OrderResponse): boolean {
    return order.status?.toUpperCase() === 'ACCEPTED' && !this.isOrderPaid(order.id);
  }

  getDelivery(orderId: number): DeliveryResponse | undefined {
    return this.deliveries().find(d => d.orderId === orderId);
  }

  getStatusColor(status: string): string {
    const s = status?.toLowerCase() || '';
    if (['completed', 'delivered'].includes(s)) return 'success';
    if (['created', 'accepted', 'pending', 'processing'].includes(s)) return 'warning';
    if (['cancelled', 'rejected'].includes(s)) return 'danger';
    if (['delivering', 'in_transit'].includes(s)) return 'info';
    return 'default';
  }

  formatPrice(price: number): string {
    return `TZS ${(price || 0).toLocaleString()}`;
  }

  formatDate(date: string): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}
