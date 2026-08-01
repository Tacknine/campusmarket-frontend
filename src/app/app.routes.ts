import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { DashboardLayout } from './components/dashboard/dashboard-layout/dashboard-layout';
import { Profile } from './components/dashboard/profile/profile';
import { UserDashboard } from './components/dashboard/user-dashboard/user-dashboard';
import { SellerDashboard } from './components/dashboard/seller-dashboard/seller-dashboard';
import { AdminDashboard } from './components/dashboard/admin-dashboard/admin-dashboard';
import { ProductList } from './components/pages/product-list/product-list';
import { ProductDetail } from './components/pages/product-detail/product-detail';
import { CartPage } from './components/pages/cart/cart';
import { Checkout } from './components/pages/checkout/checkout';
import { OrderConfirmation } from './components/pages/order-confirmation/order-confirmation';
import { PaymentComplete } from './components/pages/payment-complete/payment-complete';
import { NotFound } from './components/pages/not-found/not-found';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'products', component: ProductList },
  { path: 'products/:id', component: ProductDetail },
  { path: 'cart', component: CartPage },
  {
    path: 'checkout',
    component: Checkout,
    canActivate: [authGuard],
  },
  {
    path: 'order-confirmation/:id',
    component: OrderConfirmation,
    canActivate: [authGuard],
  },
  {
    path: 'payment-complete/:id',
    component: PaymentComplete,
    canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', component: Profile },
      {
        path: 'orders',
        component: UserDashboard,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_USER', 'ROLE_ADMIN'] }
      },
      {
        path: 'payments',
        component: UserDashboard,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_USER'] }
      },
      {
        path: 'products',
        component: SellerDashboard,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_SELLER', 'ROLE_ADMIN'] }
      },
      {
        path: 'analytics',
        component: SellerDashboard,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_SELLER', 'ROLE_ADMIN'] }
      },
      {
        path: 'users',
        component: AdminDashboard,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'categories',
        component: AdminDashboard,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'stats',
        component: AdminDashboard,
        canActivate: [roleGuard],
        data: { roles: ['ROLE_ADMIN'] }
      }
    ]
  },
  { path: '**', component: NotFound }
];
