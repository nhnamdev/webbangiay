import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Providers from '../components/providers/Providers';
import ChatBot from '../components/ChatBot/ChatBot';
import Membership from '../components/Membership/Membership';
import AdminLayout from '../components/Admin/AdminLayout';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Page0 = React.lazy(() => import('./pages/(auth)/forgot/page'));
const Page1 = React.lazy(() => import('./pages/(auth)/login/page'));
const Page2 = React.lazy(() => import('./pages/(auth)/register/page'));
const Page3 = React.lazy(() => import('./pages/(main)/addresses/page'));
const Page5 = React.lazy(() => import('./pages/(main)/blogs/news/page'));
const Page6 = React.lazy(() => import('./pages/(main)/blogs/news/[id]/page'));
const Page7 = React.lazy(() => import('./pages/(main)/cart/page'));
const Page8 = React.lazy(() => import('./pages/(main)/change-password/page'));
const Page9 = React.lazy(() => import('./pages/(main)/checkout/page'));
const Page10 = React.lazy(() => import('./pages/(main)/collections/[slug]/page'));
const Page11 = React.lazy(() => import('./pages/(main)/favorites/page'));
const Page12 = React.lazy(() => import('./pages/(main)/orders/page'));
const Page13 = React.lazy(() => import('./pages/(main)/orders/[id]/page'));
const Page35 = React.lazy(() => import('./pages/(main)/payment-return/page'));
const Page36 = React.lazy(() => import('./pages/(main)/payment-cancel/page'));
const Page15 = React.lazy(() => import('./pages/(main)/products/[id]/page'));
const Page16 = React.lazy(() => import('./pages/(main)/profile/page'));
const Page17 = React.lazy(() => import('./pages/(main)/rewards/lucky-wheel/page'));
const Page18 = React.lazy(() => import('./pages/(main)/rewards/page'));
const Page19 = React.lazy(() => import('./pages/(main)/rewards/shoe-match/page'));
const Page20 = React.lazy(() => import('./pages/(main)/rewards/snake/page'));
const Page21 = React.lazy(() => import('./pages/(main)/rewards/tetris/page'));
const Page22 = React.lazy(() => import('./pages/(main)/search/page'));
const Page23 = React.lazy(() => import('./pages/(main)/stores/page'));
const Page24 = React.lazy(() => import('./pages/admin/(dashboard)/brands/page'));
const Page25 = React.lazy(() => import('./pages/admin/(dashboard)/coupons/page'));
const Page26 = React.lazy(() => import('./pages/admin/(dashboard)/news/page'));
const Page27 = React.lazy(() => import('./pages/admin/(dashboard)/orders/page'));
const Page28 = React.lazy(() => import('./pages/admin/(dashboard)/page'));
const Page29 = React.lazy(() => import('./pages/admin/(dashboard)/points/page'));
const Page30 = React.lazy(() => import('./pages/admin/(dashboard)/products/page'));
const Page31 = React.lazy(() => import('./pages/admin/(dashboard)/users/page'));
const Page32 = React.lazy(() => import('./pages/admin/(dashboard)/vouchers/page'));
const Page34 = React.lazy(() => import('./pages/page'));

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
          <React.Suspense fallback={<LoadingSpinner />}>
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
          </React.Suspense>
        </Providers>
    </BrowserRouter>
  );
}

export default App;
