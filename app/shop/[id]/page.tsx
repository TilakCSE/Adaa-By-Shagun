"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

interface ProductData {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: Record<string, boolean>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
  
  // Bring in our global cart actions
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // Fetch the specific product from Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<ProductData, "id">;
          setProduct({ id: docSnap.id, ...data });
          setSelectedImage(data.images[0]); // Set initial image
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addToCart({
        id: `${product.id}-${selectedSize}`, // Unique ID based on product + size chosen
        productId: product.id,
        name: product.name,
        price: product.price,
        size: selectedSize,
        image: product.images[0],
        quantity: 1
      });
      // Simple feedback. We can upgrade this to a beautiful toast later!
      alert(`Added ${product.name} (Size: ${selectedSize}) to your cart!`); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-rose border-t-brand-burgundy rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-3xl text-brand-burgundy mb-4">Product Not Found</h1>
        <p className="text-brand-charcoal/70 mb-6">The item you are looking for doesn't exist or has been removed.</p>
        <Link href="/shop" className="bg-brand-rose text-white px-6 py-2 rounded-full hover:bg-brand-burgundy transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  // Ensure sizes are displayed in the correct order, up to 4XL
  const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[75vh]">
      <Link href="/shop" className="inline-flex items-center text-sm text-brand-charcoal hover:text-brand-rose mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN: Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 border border-brand-rose/10">
            <img src={selectedImage} alt={product.name} className="object-cover w-full h-full" />
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, index) => (
              <button 
                key={index}
                onClick={() => setSelectedImage(img)}
                className={`flex-shrink-0 w-24 aspect-[3/4] rounded-md overflow-hidden border-2 transition-all ${
                  selectedImage === img ? "border-brand-burgundy" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Product Details */}
        <div className="flex flex-col">
          <span className="text-sm text-brand-rose uppercase tracking-widest font-semibold mb-2">
            {product.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-brand-burgundy mb-4">
            {product.name}
          </h1>
          <p className="text-2xl text-brand-charcoal font-medium mb-6">
            ₹{product.price.toLocaleString("en-IN")}
          </p>

          <div className="w-full h-[1px] bg-brand-rose/20 mb-6"></div>

          <p className="text-brand-charcoal/80 leading-relaxed mb-8 whitespace-pre-wrap">
            {product.description}
          </p>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-brand-burgundy uppercase tracking-wider">Select Size</h3>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {sizeOrder.map((size) => {
                // Safely check if size is in stock, default to false
                const inStock = product.sizes[size] ?? false; 
                
                return (
                  <button
                    key={size}
                    disabled={!inStock}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all text-sm font-medium
                      ${!inStock ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through" 
                        : selectedSize === size 
                          ? "bg-brand-burgundy text-white border-brand-burgundy shadow-md" 
                          : "bg-white text-brand-charcoal border-brand-charcoal/30 hover:border-brand-burgundy"}
                    `}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            {!selectedSize && <p className="text-xs text-brand-rose mt-3">* Please select a size</p>}
          </div>

          <button 
            disabled={!selectedSize}
            onClick={handleAddToCart}
            className={`w-full py-4 rounded-full flex items-center justify-center text-lg font-medium transition-all shadow-sm
              ${selectedSize ? "bg-brand-rose text-white hover:bg-brand-burgundy hover:shadow-md" : "bg-gray-200 text-gray-500 cursor-not-allowed"}
            `}
          >
            <ShoppingBag className="w-5 h-5 mr-2" />
            {selectedSize ? "Add to Cart" : "Select a Size to Add"}
          </button>
          
          {/* Extra Info */}
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm text-brand-charcoal/70 border-t border-brand-rose/20 pt-6">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-brand-burgundy">Shipping</span>
              <span>Exclusive Vadodara delivery. Free shipping on orders over ₹1000. Flat ₹100 fee for orders below.</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-brand-burgundy">Support & Returns</span>
              <span>For cancellations, refunds, or replacements, please call us at +91 9054549199.</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}