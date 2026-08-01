import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Product } from '../../models/product.model';
import { Category, mapCategoryResponseToCategory } from '../../models/category.model';
import { mapProductResponseToProduct } from '../../models/product.model';

export interface Testimonial {
  id: number;
  name: string;
  major: string;
  university: string;
  avatar: string;
  comment: string;
  rating: number;
  role: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  searchQuery = signal<string>('');
  showSuggestions = signal<boolean>(false);
  activeCategoryFilter = signal<string>('All');
  categoryDropdownOpen = signal<boolean>(false);
  mobileMenuOpen = signal<boolean>(false);
  authModalOpen = signal<boolean>(false);
  authMode = signal<'login' | 'register'>('login');
  cartDrawerOpen = signal<boolean>(false);
  activeTestimonialIndex = signal<number>(0);
  toastMessage = signal<string | null>(null);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  productsLoading = signal<boolean>(true);
  categoriesLoading = signal<boolean>(true);
  productsError = signal<string | null>(null);
  categoriesError = signal<string | null>(null);

  authForm = {
    email: '',
    password: '',
    fullName: '',
    username: ''
  };

  cart = signal<{ product: Product; quantity: number }[]>([]);

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Faraja Joseph',
      major: 'BSc. Computer Science',
      university: 'University of Dar es Salaam',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      comment: 'Campus Marketplace helped me sell all my engineering textbooks within 2 hours of posting! Handing over items right at the main cafeteria was so convenient and safe.',
      rating: 5,
      role: 'Seller & Buyer'
    },
    {
      id: 2,
      name: 'Baraka Emmanuel',
      major: 'Bachelor of Commerce',
      university: 'Institute of Finance Management (IFM)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      comment: 'I bought a gently-used MacBook Air M1 for 40% less than retail price. The seller was a 3rd year student in my faculty. 100% genuine and fast transactions!',
      rating: 5,
      role: 'Active Buyer'
    },
    {
      id: 3,
      name: 'Brenda Mrema',
      major: 'Doctor of Medicine',
      university: 'MUHAS',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      comment: 'As a medical student, finding affordable reference books and anatomy kits was tough until Campus Marketplace. The category filters and campus location tags make it super simple.',
      rating: 5,
      role: 'Student Representative'
    }
  ];

  suggestions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return [];
    const list = this.products();
    return list
      .filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.seller.name.toLowerCase().includes(q))
      .slice(0, 5);
  });

  displayedProducts = computed(() => {
    let list = this.products();
    const cat = this.activeCategoryFilter();
    if (cat !== 'All') {
      list = list.filter(p => p.category.toLowerCase() === cat.toLowerCase() || (cat === 'Books' && p.category.includes('Books')));
    }
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
    }
    return list;
  });

  cartTotalCount = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.quantity, 0);
  });

  cartTotalPrice = computed(() => {
    return this.cart().reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts() {
    this.productsLoading.set(true);
    this.productsError.set(null);
    this.productService.getProducts().subscribe({
      next: (responses) => {
        this.products.set(responses.map(mapProductResponseToProduct));
        this.productsLoading.set(false);
      },
      error: (err) => {
        this.productsError.set(err.error?.message || 'Failed to load products. Please try again.');
        this.productsLoading.set(false);
      }
    });
  }

  loadCategories() {
    this.categoriesLoading.set(true);
    this.categoriesError.set(null);
    this.categoryService.getCategories().subscribe({
      next: (responses) => {
        this.categories.set(responses.map(mapCategoryResponseToCategory));
        this.categoriesLoading.set(false);
      },
      error: (err) => {
        this.categoriesError.set(err.error?.message || 'Failed to load categories. Please try again.');
        this.categoriesLoading.set(false);
      }
    });
  }

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.showSuggestions.set(val.length > 0);
  }

  selectSuggestion(productName: string) {
    this.searchQuery.set(productName);
    this.showSuggestions.set(false);
    this.scrollToSection('products-section');
  }

  filterByCategory(catName: string) {
    this.activeCategoryFilter.set(catName);
    this.categoryDropdownOpen.set(false);
    this.scrollToSection('products-section');
  }

  toggleCategoryDropdown() {
    this.categoryDropdownOpen.update(v => !v);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  openAuthModal(mode: 'login' | 'register') {
    if (mode === 'login') {
      this.router.navigate(['/login']);
      return;
    }
    this.authMode.set(mode);
    this.authModalOpen.set(true);
    this.mobileMenuOpen.set(false);
  }

  closeAuthModal() {
    this.authModalOpen.set(false);
  }

  submitAuthForm() {
    const email = this.authForm.email.trim();
    const password = this.authForm.password;
    const fullName = this.authForm.fullName.trim();
    const username = this.authForm.username.trim();

    if (!email || !password || !fullName || !username) {
      this.showToast('Please fill in all required fields.');
      return;
    }

    if (username.length < 3) {
      this.showToast('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      this.showToast('Password must be at least 6 characters.');
      return;
    }

    this.authService.register({ username, email, password, fullName, roles: ['ROLE_USER'] }).subscribe({
      next: (res) => {
        this.showToast('Account registered successfully! Please log in.');
        this.closeAuthModal();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        const errMsg = err.error?.message || err.error?.error || 'Registration failed. Username or email may already exist.';
        this.showToast(errMsg);
      }
    });
  }

  addToCart(product: Product) {
    this.cart.update(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        return current.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...current, { product, quantity: 1 }];
      }
    });
    this.showToast(`"${product.name}" added to cart!`);
  }

  removeFromCart(productId: number) {
    this.cart.update(current => current.filter(item => item.product.id !== productId));
    this.showToast('Item removed from cart');
  }

  toggleCartDrawer() {
    this.cartDrawerOpen.update(v => !v);
  }

  prevTestimonial() {
    this.activeTestimonialIndex.update(idx => (idx === 0 ? this.testimonials.length - 1 : idx - 1));
  }

  nextTestimonial() {
    this.activeTestimonialIndex.update(idx => (idx === this.testimonials.length - 1 ? 0 : idx + 1));
  }

  setTestimonial(index: number) {
    this.activeTestimonialIndex.set(index);
  }

  showToast(message: string) {
    this.toastMessage.set(message);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3500);
  }

  scrollToSection(elementId: string) {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  scrollProducts(direction: 'left' | 'right') {
    const container = document.getElementById('featured-products-container');
    if (container) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }

  formatPrice(price: number, currency: string = 'TZS'): string {
    return `${currency} ${price.toLocaleString()}`;
  }
}
