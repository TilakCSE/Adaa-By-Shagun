"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Product {
  id: string; name: string; price: number; category: string; images: string[]; createdAt: string;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest"); // "newest", "price-low", "price-high"

  useEffect(() => {
    const fetchActiveProducts = async () => {
      try {
        const q = query(collection(db, "products"), where("isActive", "==", true));
        const querySnapshot = await getDocs(q);
        const fetchedProducts: Product[] = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveProducts();
  }, []);

  // Extract unique categories from the products for the filter buttons
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Apply Filters & Sorting instantly without re-fetching
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "All") {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // newest

    return result;
  }, [products, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-brand-rose/20 pb-6 gap-4">
        <h1 className="text-4xl font-serif text-brand-burgundy">Our Collection</h1>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-full transition-colors ${showFilters ? "bg-brand-burgundy text-white border-brand-burgundy" : "text-brand-charcoal border-brand-charcoal/20 hover:text-brand-rose"}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filter & Sort</span>
        </button>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="bg-brand-rose/5 p-6 rounded-xl border border-brand-rose/20 mb-10 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 fade-in duration-200">
          <div>
            <h3 className="text-sm font-semibold text-brand-burgundy uppercase tracking-wider mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button 
                  key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat ? "bg-brand-rose text-white shadow-sm" : "bg-white text-brand-charcoal border border-gray-200 hover:border-brand-rose"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-brand-burgundy uppercase tracking-wider mb-3">Sort By</h3>
            <select 
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="w-full max-w-xs px-4 py-3 rounded-md border border-gray-200 focus:outline-none focus:border-brand-rose bg-white"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-brand-rose border-t-brand-burgundy rounded-full animate-spin"></div>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        <div className="text-center py-20 text-brand-charcoal/70">
          <p className="text-xl mb-4">No products found for this category.</p>
          <button onClick={() => setSelectedCategory("All")} className="text-brand-rose underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAndSortedProducts.map((product) => (
            <Link href={`/shop/${product.id}`} key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden rounded-lg mb-4 bg-gray-100">
                <img src={product.images[0]} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-in-out" />
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
    </div>
  );
}