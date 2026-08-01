import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CartService } from '../../../services/cart.service';
import { ToastService } from '../../../services/toast.service';
import { Product, mapProductResponseToProduct } from '../../../models/product.model';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail implements OnInit {
  product = signal<Product | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  quantity = signal(1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.error.set(null);
    this.quantity.set(1);
    this.productService.getProductById(id).subscribe({
      next: (res) => {
        this.product.set(mapProductResponseToProduct(res));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Product not found.');
        this.loading.set(false);
      }
    });
  }

  addToCart() {
    const p = this.product();
    if (p) {
      this.cartService.addItem(p, this.quantity());
      this.toast.success(`"${p.name}" added to cart!`);
    }
  }

  buyNow() {
    const p = this.product();
    if (p) {
      this.cartService.addItem(p, this.quantity());
      this.router.navigate(['/checkout']);
    }
  }

  incrementQty() {
    const p = this.product();
    if (p && this.quantity() < p.stockQuantity) {
      this.quantity.update(v => v + 1);
    }
  }

  decrementQty() {
    if (this.quantity() > 1) {
      this.quantity.update(v => v - 1);
    }
  }

  formatPrice(price: number): string {
    return `TZS ${price.toLocaleString()}`;
  }

  goBack() {
    this.router.navigate(['/products']);
  }
}
