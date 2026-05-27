import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Page0 from '../app/(auth)/forgot/page';
import Page1 from '../app/(auth)/login/page';
import Page2 from '../app/(auth)/register/page';
import Page3 from '../app/(main)/addresses/page';
import Page5 from '../app/(main)/blogs/news/page';
import Page6 from '../app/(main)/blogs/news/[id]/page';
import Page7 from '../app/(main)/cart/page';
import Page8 from '../app/(main)/change-password/page';
import Page9 from '../app/(main)/checkout/page';
import Page10 from '../app/(main)/collections/[slug]/page';
import Page11 from '../app/(main)/favorites/page';
import Page12 from '../app/(main)/orders/page';
import Page13 from '../app/(main)/orders/[id]/page';
import Page14 from '../app/(main)/payment-gateway/[method]/page';
import Page15 from '../app/(main)/products/[id]/page';
import Page16 from '../app/(main)/profile/page';
import Page17 from '../app/(main)/rewards/lucky-wheel/page';
import Page18 from '../app/(main)/rewards/page';
import Page19 from '../app/(main)/rewards/shoe-match/page';
import Page20 from '../app/(main)/rewards/snake/page';
import Page21 from '../app/(main)/rewards/tetris/page';
import Page22 from '../app/(main)/search/page';
import Page23 from '../app/(main)/stores/page';
import Page24 from '../app/admin/(dashboard)/brands/page';
import Page25 from '../app/admin/(dashboard)/coupons/page';
import Page26 from '../app/admin/(dashboard)/news/page';
import Page27 from '../app/admin/(dashboard)/orders/page';
import Page28 from '../app/admin/(dashboard)/page';
import Page29 from '../app/admin/(dashboard)/points/page';
import Page30 from '../app/admin/(dashboard)/products/page';
import Page31 from '../app/admin/(dashboard)/users/page';
import Page32 from '../app/admin/(dashboard)/vouchers/page';
import Page34 from '../app/page';
import Providers from '../components/providers/Providers';
import ChatBot from '../components/ChatBot/ChatBot';
import Membership from '../components/Membership/Membership';

function App() {
  return (
    <BrowserRouter>
        <Providers>
          <Membership />
          <ChatBot />
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
        <Route path="/payment-gateway/:method" element={<Page14 />} />
        <Route path="/products/:id" element={<Page15 />} />
        <Route path="/profile" element={<Page16 />} />
        <Route path="/rewards/lucky-wheel" element={<Page17 />} />
        <Route path="/rewards" element={<Page18 />} />
        <Route path="/rewards/shoe-match" element={<Page19 />} />
        <Route path="/rewards/snake" element={<Page20 />} />
        <Route path="/rewards/tetris" element={<Page21 />} />
        <Route path="/search" element={<Page22 />} />
        <Route path="/stores" element={<Page23 />} />
        <Route path="/admin/brands" element={<Page24 />} />
        <Route path="/admin/coupons" element={<Page25 />} />
        <Route path="/admin/news" element={<Page26 />} />
        <Route path="/admin/orders" element={<Page27 />} />
        <Route path="/admin" element={<Page28 />} />
        <Route path="/admin/points" element={<Page29 />} />
        <Route path="/admin/products" element={<Page30 />} />
        <Route path="/admin/users" element={<Page31 />} />
        <Route path="/admin/vouchers" element={<Page32 />} />
        <Route path="/" element={<Page34 />} />
          </Routes>
        </Providers>
    </BrowserRouter>
  );
}

export default App;
