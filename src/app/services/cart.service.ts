import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';
import { CartItem } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly STORAGE_KEY = 'campus_cart';

  items = signal<CartItem[]>(this.loadFromStorage());

  totalCount = computed(() => this.items().reduce((sum, i) => sum + i.quantity, 0));

  totalPrice = computed(() => this.items().reduce((sum, i) => sum + i.product.price * i.quantity, 0));

  cartOpen = signal(false);

  constructor() {}

  addItem(product: Product, quantity: number = 1) {
    this.items.update(current => {
      const existing = current.find(i => i.product.id === product.id);
      if (existing) {
        return current.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...current, { product, quantity }];
    });
    this.saveToStorage();
  }

  removeItem(productId: number) {
    this.items.update(current => current.filter(i => i.product.id !== productId));
    this.saveToStorage();
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    this.items.update(current =>
      current.map(i => (i.product.id === productId ? { ...i, quantity } : i))
    );
    this.saveToStorage();
  }

  clear() {
    this.items.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  toggleCart() {
    this.cartOpen.update(v => !v);
  }

  private saveToStorage() {
    try {
      const data = this.items().map(i => ({ productId: i.product.id, quantity: i.quantity, product: i.product }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((i: any) => i.product && i.quantity > 0);
    } catch {
      return [];
    }
  }
}
