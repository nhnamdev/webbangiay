import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Page0 from './pages/(auth)/forgot/page';
import Page1 from './pages/(auth)/login/page';
import Page2 from './pages/(auth)/register/page';
import Page3 from './pages/(main)/addresses/page';
import Page5 from './pages/(main)/blogs/news/page';
import Page6 from './pages/(main)/blogs/news/[id]/page';
import Page7 from './pages/(main)/cart/page';
import Page8 from './pages/(main)/change-password/page';
import Page9 from './pages/(main)/checkout/page';
import Page10 from './pages/(main)/collections/[slug]/page';
import Page11 from './pages/(main)/favorites/page';
import Page12 from './pages/(main)/orders/page';
import Page13 from './pages/(main)/orders/[id]/page';
import Page35 from './pages/(main)/payment-return/page';
import Page36 from './pages/(main)/payment-cancel/page';
import Page15 from './pages/(main)/products/[id]/page';
import Page16 from './pages/(main)/profile/page';
import Page17 from './pages/(main)/rewards/lucky-wheel/page';
import Page18 from './pages/(main)/rewards/page';
import Page19 from './pages/(main)/rewards/shoe-match/page';
import Page20 from './pages/(main)/rewards/snake/page';
import Page21 from './pages/(main)/rewards/tetris/page';
import Page22 from './pages/(main)/search/page';
import Page23 from './pages/(main)/stores/page';
import Page24 from './pages/admin/(dashboard)/brands/page';
import Page25 from './pages/admin/(dashboard)/coupons/page';
import Page26 from './pages/admin/(dashboard)/news/page';
import Page27 from './pages/admin/(dashboard)/orders/page';
import Page28 from './pages/admin/(dashboard)/page';
import Page29 from './pages/admin/(dashboard)/points/page';
import Page30 from './pages/admin/(dashboard)/products/page';
import Page31 from './pages/admin/(dashboard)/users/page';
import Page32 from './pages/admin/(dashboard)/vouchers/page';
import Page34 from './pages/page';
import Providers from '../components/providers/Providers';
import ChatBot from '../components/ChatBot/ChatBot';
import Membership from '../components/Membership/Membership';
import AdminLayout from '../components/Admin/AdminLayout';

function FloatingButtons() {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) return null;
  return <><Membership /><ChatBot /></>;
}

function App() {
  return (
    <BrowserRouter>
        <Providers>
          <FloatingButtons />
          <Routes>
        <Route path="/forgot" element={<Page0 />} />
        <Route path="/login" element={<Page1 />} />
        <Route path="/register" element={<Page2 />} />
        <Route path="/addresses" element={<Page3 />} />
        <Route path="/blogs/news" element={<Page5 />} />
        <Route path="/blogs/news/:id" element={<Page6 />} />
        <Route path="/cart" element={<Page7 />} />
        <Route path="/change-password" element={<Page8 />} />
        <Route path="/checkout" element={<Page9 />} />
        <Route path="/collections/:slug" element={<Page10 />} />
        <Route path="/favorites" element={<Page11 />} />
        <Route path="/orders" element={<Page12 />} />
        <Route path="/orders/:id" element={<Page13 />} />
        <Route path="/products/:id" element={<Page15 />} />
        <Route path="/profile" element={<Page16 />} />
        <Route path="/rewards/lucky-wheel" element={<Page17 />} />
        <Route path="/rewards" element={<Page18 />} />
        <Route path="/rewards/shoe-match" element={<Page19 />} />
        <Route path="/rewards/snake" element={<Page20 />} />
        <Route path="/rewards/tetris" element={<Page21 />} />
        <Route path="/search" element={<Page22 />} />
        <Route path="/stores" element={<Page23 />} />
        <Route path="/admin" element={<AdminLayout><Page28 /></AdminLayout>} />
        <Route path="/admin/brands" element={<AdminLayout><Page24 /></AdminLayout>} />
        <Route path="/admin/coupons" element={<AdminLayout><Page25 /></AdminLayout>} />
        <Route path="/admin/news" element={<AdminLayout><Page26 /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><Page27 /></AdminLayout>} />
        <Route path="/admin/points" element={<AdminLayout><Page29 /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><Page30 /></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout><Page31 /></AdminLayout>} />
        <Route path="/admin/vouchers" element={<AdminLayout><Page32 /></AdminLayout>} />
        <Route path="/payment-return" element={<Page35 />} />
        <Route path="/payment-cancel" element={<Page36 />} />
        <Route path="/" element={<Page34 />} />
          </Routes>
        </Providers>
    </BrowserRouter>
  );
}

export default App;
