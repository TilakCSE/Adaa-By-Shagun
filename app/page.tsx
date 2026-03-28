"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowRight, Star, Truck, ShieldCheck, Sparkles } from "lucide-react";

interface Product {
  id: string; name: string; price: number; category: string; images: string[]; createdAt: string;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), where("isActive", "==", true));
        const querySnapshot = await getDocs(q);
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() } as Product);
        });
        
        // Sort by newest and grab the top 4
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 🌟 HERO SECTION */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-brand-cream">
        {/* Subtle background pattern or color gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-rose/5 to-brand-cream z-0"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="text-brand-rose font-semibold tracking-widest uppercase text-sm mb-4 block flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> New Collection Arrived
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-brand-burgundy mb-6 leading-tight">
            Elegance in <br className="hidden md:block" /> Every Thread
          </h1>
          <p className="text-lg md:text-xl text-brand-charcoal/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Discover our latest curation of premium, handcrafted outfits designed to make you feel extraordinary in your everyday life and special moments.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/shop" className="bg-brand-burgundy text-white px-8 py-4 rounded-full hover:bg-brand-charcoal transition-all duration-300 shadow-xl hover:shadow-2xl font-medium tracking-wide flex items-center gap-2 group w-full sm:w-auto justify-center">
              Shop Now 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/about" className="bg-white text-brand-burgundy border border-brand-rose/20 px-8 py-4 rounded-full hover:bg-brand-rose/5 transition-colors duration-300 font-medium tracking-wide w-full sm:w-auto justify-center flex">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* 👗 FEATURED COLLECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-brand-rose/20 pb-6">
            <div>
              <h2 className="text-4xl font-serif text-brand-burgundy mb-2">New Arrivals</h2>
              <p className="text-brand-charcoal/70">The latest additions to our boutique.</p>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-2 text-brand-rose hover:text-brand-burgundy font-medium transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-brand-rose border-t-brand-burgundy rounded-full animate-spin"></div>
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-10">More products coming soon!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <Link href={`/shop/${product.id}`} key={product.id} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-gray-100 shadow-sm">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    {/* Subtle "New" badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-brand-burgundy text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      NEW
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-brand-rose uppercase tracking-widest font-semibold">{product.category}</span>
                    <h3 className="text-lg text-brand-charcoal font-medium group-hover:text-brand-burgundy transition-colors truncate">{product.name}</h3>
                    <p className="text-brand-burgundy font-semibold">₹{product.price.toLocaleString("en-IN")}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {/* Mobile View All Button */}
          <div className="mt-10 text-center md:hidden">
            <Link href="/shop" className="inline-flex items-center gap-2 text-brand-rose hover:text-brand-burgundy font-medium transition-colors border border-brand-rose/30 px-6 py-3 rounded-full">
              View All Collections <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 🛡️ BRAND VALUES */}
      <section className="py-20 bg-brand-rose/5 border-t border-b border-brand-rose/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-rose/20 text-brand-burgundy">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-brand-burgundy mb-3">Premium Quality</h3>
              <p className="text-brand-charcoal/70">Handpicked fabrics and intricate craftsmanship in every piece.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-rose/20 text-brand-burgundy">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-brand-burgundy mb-3">Vadodara Delivery</h3>
              <p className="text-brand-charcoal/70">Exclusive delivery within Vadodara. Free shipping on orders over ₹1,000.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-rose/20 text-brand-burgundy">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif text-brand-burgundy mb-3">Secure Payments</h3>
              <p className="text-brand-charcoal/70">100% secure UPI payments integrated directly for your convenience.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}