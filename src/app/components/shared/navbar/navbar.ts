import { Component, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CartService } from '../../../services/cart.service';
import { CategoryService } from '../../../services/category.service';
import { Category, mapCategoryResponseToCategory } from '../../../models/category.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  mobileMenuOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  categoryDropdownOpen = signal<boolean>(false);
  categories = signal<Category[]>([]);

  user = computed(() => this.authService.getUser());

  isLoggedIn = computed(() => this.authService.isLoggedIn());

  userInitial = computed(() => {
    const u = this.user();
    if (u?.fullName) return u.fullName.charAt(0).toUpperCase();
    if (u?.username) return u.username.charAt(0).toUpperCase();
    return 'U';
  });

  constructor(
    private router: Router,
    private authService: AuthService,
    public cartService: CartService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (responses) => {
        this.categories.set(responses.map(mapCategoryResponseToCategory));
      },
      error: () => {}
    });
  }

  searchProducts() {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { q: query } });
    } else {
      this.router.navigate(['/products']);
    }
    this.mobileMenuOpen.set(false);
  }

  onSearchInput(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(v => !v);
  }

  toggleCategoryDropdown() {
    this.categoryDropdownOpen.update(v => !v);
  }

  closeCategoryDropdown() {
    this.categoryDropdownOpen.set(false);
  }

  toggleCart() {
    this.cartService.toggleCart();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-dropdown-wrapper')) {
      this.categoryDropdownOpen.set(false);
    }
  }
}
