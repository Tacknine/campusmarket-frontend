import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { PaymentService } from '../../../services/payment.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Navbar } from '../../shared/navbar/navbar';

export interface CountryCode {
  code: string;
  name: string;
  dial: string;
  flag: string;
  mobilePrefix: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit, OnDestroy {
  // ============================================================
  // STATE
  // ============================================================
  step = signal(1);
  submitting = signal(false);
  paying = signal(false);
  error = signal<string | null>(null);
  loadingOrder = signal(false);
  isPayMode = signal(false);
  orderStatus = signal<string | null>(null);
  private statusTimer: any = null;

  // Step 1: Delivery
  deliveryAddress = '';
  contactPhone = '';

  // Step 3: Payment
  paymentMethod = signal<'CASH' | 'MPESA' | null>(null);
  mpesaPhoneNumber = '';
  createdOrderId = signal<number | null>(null);

  countries: CountryCode[] = [
    { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', mobilePrefix: '7' },
    { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿', mobilePrefix: '7' },
    { code: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬', mobilePrefix: '7' },
    { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭', mobilePrefix: '5' },
    { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬', mobilePrefix: '7' },
    { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼', mobilePrefix: '7' },
    { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', mobilePrefix: '6' },
  ];

  selectedCountry = signal<CountryCode>(this.countries[0]);

  // Order Data
  orderItems: any[] = [];
  orderTotal: number = 0;

  constructor(
    public cartService: CartService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  // ============================================================
  // LIFECYCLE
  // ============================================================
  ngOnInit() {
    const payOrderId = this.route.snapshot.queryParamMap.get('payOrderId');
    if (payOrderId) {
      this.loadOrderForPayment(+payOrderId);
      return;
    }
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }
    this.loadCartData();
  }

  ngOnDestroy() {
    this.stopStatusPolling();
  }

  // ============================================================
  // STATUS POLLING: wait for the seller to accept the order
  // ============================================================
  private stopStatusPolling() {
    if (this.statusTimer) {
      clearInterval(this.statusTimer);
      this.statusTimer = null;
    }
  }

  private startStatusPolling(orderId: number) {
    this.stopStatusPolling();
    this.statusTimer = setInterval(() => this.refreshOrderStatus(orderId), 5000);
  }

  refreshOrderStatus(orderId: number) {
    this.orderService.getOrderSummary(orderId).subscribe({
      next: (res) => {
        const summary = res.data;
        this.orderStatus.set((summary.status || '').toUpperCase());
        if (summary.totalPrice) this.orderTotal = summary.totalPrice;
        if (this.isOrderAccepted()) {
          this.stopStatusPolling();
          this.toast.success('The seller has accepted your order! You can now proceed with payment.');
        }
      },
      error: () => {}
    });
  }

  isOrderAccepted(): boolean {
    return this.orderStatus() === 'ACCEPTED';
  }

  canProceedToPayment(): boolean {
    return this.isOrderAccepted();
  }

  checkOrderStatus() {
    const orderId = this.createdOrderId();
    if (orderId) this.refreshOrderStatus(orderId);
  }

  // ============================================================
  // PAY-MODE: Pay for an already-created order
  // ============================================================
  private loadOrderForPayment(orderId: number) {
    this.isPayMode.set(true);
    this.loadingOrder.set(true);
    this.error.set(null);

    this.orderService.getOrderSummary(orderId).subscribe({
      next: (res) => {
        const summary = res.data;
        this.createdOrderId.set(summary.orderId);
        this.orderItems = summary.items.map((item: any) => ({
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        }));
        this.orderTotal = summary.totalPrice;
        this.deliveryAddress = summary.deliveryAddress || '';
        this.contactPhone = summary.contactPhone || '';
        if (summary.payment?.status && ['COMPLETED', 'PAID', 'SUCCESS'].includes((summary.payment.status || '').toUpperCase())) {
          this.toast.info('This order has already been paid.');
          this.router.navigate(['/order-confirmation', summary.orderId]);
          return;
        }
        this.orderStatus.set((summary.status || '').toUpperCase());
        if (!this.isOrderAccepted()) {
          this.startStatusPolling(summary.orderId);
        }
        this.step.set(3);
        this.loadingOrder.set(false);
      },
      error: (err) => {
        this.loadingOrder.set(false);
        const msg = err.error?.message || 'Failed to load order for payment.';
        this.error.set(msg);
        this.toast.error(msg);
      }
    });
  }

  // ============================================================
  // DATA LOADING
  // ============================================================
  private loadCartData() {
    this.orderItems = this.cartService.items().map(i => ({
      productId: i.product.id,
      productName: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
      sellerId: i.product.sellerId,
      imageUrl: ''
    }));
    this.orderTotal = this.cartService.totalPrice();
  }

  // ============================================================
  // STEP 1: DELIVERY
  // ============================================================
  nextStep() {
    if (!this.deliveryAddress.trim() || !this.contactPhone.trim()) {
      this.toast.error('Please fill in all delivery details.');
      return;
    }
    this.loadCartData();
    this.step.set(2);
  }

  goBack() {
    this.step.update(s => Math.max(1, s - 1));
    this.loadCartData();
  }

  // ============================================================
  // STEP 2: PLACE ORDER
  // ============================================================
  placeOrder() {
    this.submitting.set(true);
    this.error.set(null);

    const items = this.orderItems.map(i => ({
      productId: i.productId,
      productName: i.productName,
      price: i.price,
      quantity: i.quantity
    }));

    const sellerId = this.orderItems[0]?.sellerId || 0;

    this.orderService.createOrder({
      sellerId,
      deliveryAddress: this.deliveryAddress,
      contactPhone: this.contactPhone,
      items
    }).subscribe({
      next: (order) => {
        const orderId = order.id;
        this.createdOrderId.set(orderId);
        this.orderStatus.set((order.status || 'CREATED').toUpperCase());

        this.orderService.getOrderSummary(orderId).subscribe({
          next: (summaryResponse) => {
            const summary = summaryResponse.data;

            this.orderItems = summary.items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              price: item.price,
              quantity: item.quantity,
              subtotal: item.subtotal
            }));
            this.orderTotal = summary.totalPrice;
            this.orderStatus.set((summary.status || 'CREATED').toUpperCase());

            this.cartService.clear();
            if (!this.isOrderAccepted()) {
              this.startStatusPolling(orderId);
            }
            this.step.set(3);
            this.submitting.set(false);
            this.toast.success('Order placed successfully! Please wait for the seller to confirm your order.');
          },
          error: (err) => {
            this.orderTotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
            this.orderItems = items.map(i => ({
              ...i,
              subtotal: i.price * i.quantity
            }));
            this.cartService.clear();
            if (!this.isOrderAccepted()) {
              this.startStatusPolling(orderId);
            }
            this.step.set(3);
            this.submitting.set(false);
            this.toast.success('Order placed successfully! Please wait for the seller to confirm your order.');
            console.warn('Failed to fetch order summary from backend, using local data:', err);
          }
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.error.set(err.error?.message || 'Failed to place order. Please try again.');
        this.toast.error(this.error()!);
      }
    });
  }

  // ============================================================
  // STEP 3: PAYMENT
  // ============================================================
  selectPayment(method: 'CASH' | 'MPESA') {
    this.paymentMethod.set(method);
    this.error.set(null);
  }

  selectCountry(country: CountryCode) {
    this.selectedCountry.set(country);
    this.error.set(null);
  }

  // Normalize phone to E.164: e.g. 0712345678 -> 254712345678
  private normalizePhone(raw: string, country: CountryCode): string {
    let digits = raw.replace(/[^\d]/g, '');
    if (digits.startsWith('00')) {
      digits = digits.slice(2);
    }
    if (digits.startsWith(country.dial.replace('+', ''))) {
      return digits;
    }
    if (digits.startsWith('0')) {
      return country.dial.replace('+', '') + digits.slice(1);
    }
    return country.dial.replace('+', '') + digits;
  }

  private isValidPhone(raw: string, country: CountryCode): boolean {
    let digits = raw.replace(/[^\d]/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith(country.dial.replace('+', ''))) {
      digits = digits.slice(country.dial.replace('+', '').length);
    }
    if (digits.startsWith('0')) digits = digits.slice(1);
    return digits.length >= 9 && digits.length <= 10;
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.startsWith('254')) {
      return '0' + cleaned.substring(3);
    }
    return cleaned;
  }

  confirmPayment() {
    const orderId = this.createdOrderId();
    const method = this.paymentMethod();

    if (!orderId || !method) {
      this.error.set('Please select a payment method.');
      this.toast.error('Please select a payment method.');
      return;
    }

    if (!this.isOrderAccepted()) {
      this.error.set('Please wait for the seller to confirm your order before making a payment.');
      this.toast.error('Please wait for the seller to confirm your order before making a payment.');
      return;
    }

    const country = this.selectedCountry();

    // Validate M-Pesa phone number
    if (method === 'MPESA') {
      if (!this.mpesaPhoneNumber.trim()) {
        this.error.set('Phone number is required for M-Pesa payments.');
        this.toast.error('Phone number is required for M-Pesa payments.');
        return;
      }
      if (!this.isValidPhone(this.mpesaPhoneNumber, country)) {
        this.error.set(`Please enter a valid ${country.name} mobile number, e.g. ${country.dial}${country.mobilePrefix}XXXXXXXX`);
        this.toast.error('Invalid phone number format.');
        return;
      }
    }

    this.paying.set(true);
    this.error.set(null);

    const total = this.orderTotal;
    const payment$ = method === 'CASH'
      ? this.paymentService.recordCashPayment(orderId, total)
      : this.paymentService.recordMpesaPayment(orderId, total, this.normalizePhone(this.mpesaPhoneNumber, country));

    payment$.subscribe({
      next: () => {
        if (method === 'CASH') {
          this.toast.success('Payment completed successfully!');
          this.router.navigate(['/payment-complete', orderId]);
          return;
        }
        // M-Pesa: STK push initiated by the Safaricom gateway.
        this.paying.set(false);
        this.toast.success('Payment request sent! Confirm the prompt on your phone.');
        this.router.navigate(['/payment-complete', orderId]);
      },
      error: (err) => {
        this.paying.set(false);
        const msg = err.error?.message || 'Payment request failed. You can retry from your orders.';
        this.error.set(msg);
        this.toast.error(msg);
      }
    });
  }

  skipPayment() {
    const orderId = this.createdOrderId();
    if (orderId) {
      this.router.navigate(['/order-confirmation', orderId]);
    }
  }

  // ============================================================
  // HELPERS
  // ============================================================
  formatPrice(price: number): string {
    return `TZS ${price.toLocaleString()}`;
  }

  getOrderItems() {
    return this.orderItems;
  }

  getOrderTotal() {
    return this.orderTotal;
  }

  hasOrderData() {
    return this.orderItems.length > 0 && this.orderTotal > 0;
  }
}
