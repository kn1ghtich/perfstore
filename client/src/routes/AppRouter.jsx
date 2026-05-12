import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AdminLayout from '../components/admin/AdminLayout';
import AdminGuard from '../components/admin/AdminGuard';
import HomePage from '../pages/HomePage';
import CatalogPage from '../pages/CatalogPage';
import ProductPage from '../pages/ProductPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProfilePage from '../pages/ProfilePage';
import CartPage from '../pages/CartPage';
import OrdersPage from '../pages/OrdersPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminProductEditPage from '../pages/admin/AdminProductEditPage';
import AdminProductCreatePage from '../pages/admin/AdminProductCreatePage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import StoresPage from '../pages/StoresPage';
import AdminStoresPage from '../pages/admin/AdminStoresPage';
import AdminStoreInventoryPage from '../pages/admin/AdminStoreInventoryPage';
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage';
import AdminBrandsPage from '../pages/admin/AdminBrandsPage';
import AdminNotificationsPage from '../pages/admin/AdminNotificationsPage';
import AdminSlidesPage from '../pages/admin/AdminSlidesPage';
import WishlistPage from '../pages/WishlistPage';

export default function AppRouter() {
  return (
    <Routes>
        {/* Main site */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin panel */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="products/new" element={<AdminProductCreatePage />} />
          <Route path="products/:id/edit" element={<AdminProductEditPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="stores" element={<AdminStoresPage />} />
          <Route path="stores/:id" element={<AdminStoreInventoryPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="slides" element={<AdminSlidesPage />} />
        </Route>
    </Routes>
  );
}
