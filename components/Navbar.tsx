"use client";

import Link from "next/link";
import { ShoppingBag, User, Menu, X, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Define your admin emails here so the frontend always knows!
  const adminEmails = ["contact.adaabyshagun@gmail.com"];

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      
      // Instantly verify admin status via email
      if (user && user.email && adminEmails.includes(user.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const totalItems = getTotalItems();

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-cream border-b border-brand-rose/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-3xl font-serif text-brand-burgundy tracking-wider">
              Adaa
              <span className="text-sm block text-brand-rose font-sans tracking-widest uppercase mt-[-4px]">
                By Shagun
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-brand-charcoal hover:text-brand-rose transition-colors font-medium">Home</Link>
            <Link href="/shop" className="text-brand-charcoal hover:text-brand-rose transition-colors font-medium">Shop</Link>
            <Link href="/about" className="text-brand-charcoal hover:text-brand-rose transition-colors font-medium">About</Link>
            <Link href="/contact" className="text-brand-charcoal hover:text-brand-rose transition-colors font-medium">Contact</Link>
            
            {/* Show Admin Dashboard Link ONLY for Admins */}
            {isAdmin && (
              <Link href="/admin" className="text-brand-burgundy flex items-center gap-1 font-bold bg-brand-rose/10 px-3 py-1.5 rounded-full hover:bg-brand-rose/20 transition-colors">
                <ShieldCheck className="w-4 h-4" /> Admin
              </Link>
            )}
          </div>

          {/* Icons Section */}
          <div className="flex items-center space-x-4">
            <Link href={isLoggedIn ? "/account" : "/login"} className="text-brand-burgundy hover:text-brand-rose transition-colors" title={isLoggedIn ? "My Account" : "Log In"}>
              <User className="h-6 w-6" />
            </Link>
            
            <Link href="/cart" className="text-brand-burgundy hover:text-brand-rose transition-colors relative">
              <ShoppingBag className="h-6 w-6" />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-brand-rose text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button className="md:hidden text-brand-burgundy" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-brand-cream border-t border-brand-rose/20 shadow-md pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-brand-charcoal hover:text-brand-rose w-full text-center font-medium">Home</Link>
            <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-brand-charcoal hover:text-brand-rose w-full text-center font-medium">Shop</Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-brand-burgundy font-bold w-full text-center bg-brand-rose/10">Admin Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}