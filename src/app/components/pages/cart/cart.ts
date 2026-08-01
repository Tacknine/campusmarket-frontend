import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class CartPage {
  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {}

  incrementQty(productId: number) {
    const item = this.cartService.items().find(i => i.product.id === productId);
    if (item && item.quantity < item.product.stockQuantity) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decrementQty(productId: number) {
    const item = this.cartService.items().find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  removeItem(productId: number) {
    this.cartService.removeItem(productId);
  }

  clearCart() {
    this.cartService.clear();
  }

  proceedToCheckout() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/checkout']);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
    }
  }

  formatPrice(price: number): string {
    return `TZS ${price.toLocaleString()}`;
  }
}
