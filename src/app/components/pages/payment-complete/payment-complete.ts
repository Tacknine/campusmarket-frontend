import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService, OrderSummaryResponse } from '../../../services/order.service';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-payment-complete',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './payment-complete.html',
  styleUrl: './payment-complete.scss',
})
export class PaymentComplete implements OnInit {
  order = signal<OrderSummaryResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
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

  getTitle(): string {
    if (this.isPaid()) return 'Payment Completed!';
    if (this.isPaymentPending()) return 'Payment Processing';
    return 'Payment Not Completed';
  }

  getDescription(): string {
    if (this.isPaid()) {
      return 'Your payment was successful. Please wait for your product — the seller is preparing your order.';
    }
    if (this.isPaymentPending()) {
      return 'Your payment is being confirmed by Safaricom. Please wait for your product once it is approved.';
    }
    return 'No completed payment was found for this order.';
  }

  formatPrice(price: number): string {
    return `TZS ${(price || 0).toLocaleString()}`;
  }
}
