import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { CartService } from '../../../services/cart.service';
import { ToastService } from '../../../services/toast.service';
import { Product, mapProductResponseToProduct } from '../../../models/product.model';
import { Category, mapCategoryResponseToCategory } from '../../../models/category.model';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchQuery = signal('');
  selectedCategory = signal('All');
  sortBy = signal<string>('default');
  priceMin = signal<number | null>(null);
  priceMax = signal<number | null>(null);
  mobileFiltersOpen = signal(false);

  sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'name-asc', label: 'Name: A-Z' },
  ];

  filteredProducts = computed(() => {
    let list = this.products();
    const cat = this.selectedCategory();
    if (cat !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === cat.toLowerCase());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    const min = this.priceMin();
    const max = this.priceMax();
    if (min !== null) {
      list = list.filter(p => p.price >= min);
    }
    if (max !== null) {
      list = list.filter(p => p.price <= max);
    }
    const sort = this.sortBy();
    switch (sort) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'name-asc':
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return [...list].sort((a, b) => b.id - a.id);
      default:
        return list;
    }
  });

  resultCount = computed(() => this.filteredProducts().length);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService,
    public cartService: CartService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery.set(params['q']);
      }
      if (params['category']) {
        this.selectedCategory.set(params['category']);
      }
    });
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.loading.set(true);
    this.error.set(null);
    this.productService.getProducts().subscribe({
      next: (responses) => {
        this.products.set(responses.map(mapProductResponseToProduct));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load products.');
        this.loading.set(false);
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (responses) => {
        this.categories.set(responses.map(mapCategoryResponseToCategory));
      },
      error: () => {}
    });
  }

  addToCart(product: Product) {
    this.cartService.addItem(product);
    this.toast.success(`"${product.name}" added to cart!`);
  }

  selectCategory(name: string) {
    this.selectedCategory.set(name);
  }

  clearFilters() {
    this.searchQuery.set('');
    this.selectedCategory.set('All');
    this.sortBy.set('default');
    this.priceMin.set(null);
    this.priceMax.set(null);
  }

  formatPrice(price: number): string {
    return `TZS ${price.toLocaleString()}`;
  }

  toggleMobileFilters() {
    this.mobileFiltersOpen.update(v => !v);
  }
}
