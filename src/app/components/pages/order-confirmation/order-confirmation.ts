import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService, OrderSummaryResponse } from '../../../services/order.service';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.scss',
})
export class OrderConfirmation implements OnInit {
  order = signal<OrderSummaryResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadOrder(id);
      }
    });
  }

  private loadOrder(id: number) {
    this.orderService.getOrderSummary(id).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.orderService.getOrderById(id).subscribe({
          next: (order) => {
            this.order.set({
              orderId: order.id,
              status: order.status,
              totalPrice: order.totalPrice,
              deliveryAddress: order.deliveryAddress,
              contactPhone: order.contactPhone,
              items: order.items as any,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
              payment: null as any,
              buyer: null as any,
              seller: null as any,
            });
            this.loading.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.message || 'Order not found.');
            this.loading.set(false);
          }
        });
      }
    });
  }

  getPayment(): any {
    return this.order()?.payment;
  }

  isPaid(): boolean {
    const status = (this.getPayment()?.status || '').toUpperCase();
    return ['COMPLETED', 'PAID', 'SUCCESS'].includes(status);
  }

  isPaymentPending(): boolean {
    const status = (this.getPayment()?.status || '').toUpperCase();
    return ['PENDING', 'PROCESSING', 'INITIATED'].includes(status);
  }

  hasPayment(): boolean {
    return !!this.getPayment()?.method;
  }

  getTitle(): string {
    if (this.isPaid()) return 'Payment Successful!';
    if (this.hasPayment()) return 'Order Placed Successfully!';
    return 'Order Placed Successfully!';
  }

  getDescription(): string {
    if (this.isPaid()) {
      return 'Your payment was received. The seller has been notified and will confirm your order shortly.';
    }
    if (this.getOrderStatus() === 'ACCEPTED') {
      return 'Your order has been accepted by the seller. Complete your payment to continue.';
    }
    if (this.isPaymentPending()) {
      return 'Your order has been received and is pending seller confirmation. Your payment is being confirmed by Safaricom.';
    }
    return 'Your order has been received and is pending seller confirmation. You\'ll be able to pay once the seller accepts your order.';
  }

  getPaymentMethod(): string {
    const method = (this.getPayment()?.method || '').toUpperCase();
    if (method === 'MPESA') return 'M-Pesa (Safaricom)';
    if (method === 'CASH') return 'Cash on Delivery';
    return '—';
  }

  getPaymentStatus(): string {
    if (!this.hasPayment()) return 'NOT PAID';
    return (this.getPayment()?.status || 'PENDING').toUpperCase();
  }

  getOrderStatus(): string {
    return (this.order()?.status || 'CREATED').toUpperCase();
  }

  canPay(): boolean {
    return this.getOrderStatus() === 'ACCEPTED' && !this.isPaid();
  }

  payNow() {
    if (this.order()) {
      this.router.navigate(['/checkout'], { queryParams: { payOrderId: this.order()!.orderId } });
    }
  }

  getPaymentBadgeClass(): string {
    if (this.isPaid()) return 'badge-success';
    if (this.isPaymentPending()) return 'badge-pending';
    if (this.hasPayment()) return 'badge-failed';
    return 'badge-neutral';
  }

  formatPrice(price: number): string {
    return `TZS ${(price || 0).toLocaleString()}`;
  }
}
