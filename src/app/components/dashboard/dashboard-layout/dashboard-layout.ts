import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.scss',
})
export class DashboardLayout {
  sidebarCollapsed = signal(false);
  user = signal<any>(null);

  menuItems = signal<{ label: string; route: string; icon: string; roles: string[] }[]>([]);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user.set(this.authService.getUser());
    this.buildMenu();
  }

  private buildMenu() {
    const items = [
      { label: 'My Profile', route: '/dashboard/profile', icon: 'user', roles: ['ROLE_USER', 'ROLE_SELLER', 'ROLE_ADMIN'] },
      { label: 'Dashboard', route: '/dashboard/orders', icon: 'grid', roles: ['ROLE_USER'] },
      { label: 'My Products', route: '/dashboard/products', icon: 'box', roles: ['ROLE_SELLER'] },
      { label: 'Analytics', route: '/dashboard/analytics', icon: 'chart', roles: ['ROLE_SELLER'] },
      { label: 'Manage Users', route: '/dashboard/users', icon: 'users', roles: ['ROLE_ADMIN'] },
      { label: 'Categories', route: '/dashboard/categories', icon: 'grid', roles: ['ROLE_ADMIN'] },
      { label: 'Platform Stats', route: '/dashboard/stats', icon: 'bar-chart', roles: ['ROLE_ADMIN'] },
    ];
    this.menuItems.set(items.filter(item =>
      item.roles.some(r => this.user()?.roles?.includes(r))
    ));
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
