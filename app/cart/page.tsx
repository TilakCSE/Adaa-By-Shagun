"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, ArrowRight, Info } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-rose border-t-brand-burgundy rounded-full animate-spin"></div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const deliveryFee = subtotal < 1000 ? 100 : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[70vh]">
      <h1 className="text-4xl font-serif text-brand-burgundy mb-10 border-b border-brand-rose/20 pb-4">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-brand-rose/10">
          <p className="text-brand-charcoal text-lg mb-6">Your cart is currently empty.</p>
          <Link href="/shop" className="inline-block bg-brand-rose text-white px-8 py-3 rounded-full hover:bg-brand-burgundy transition-colors font-medium">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Cart Items List */}
          <div className="flex-grow space-y-6">
            
            {/* DELIVERY FEE POP-UP PROMPT */}
            {subtotal < 1000 && (
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-100 flex items-start gap-3 shadow-sm">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
                <div>
                  <p className="font-medium">You are ₹{(1000 - subtotal).toLocaleString("en-IN")} away from FREE delivery!</p>
                  <p className="text-sm opacity-80 mt-1">Orders under ₹1,000 have a flat ₹100 delivery fee.</p>
                </div>
              </div>
            )}

            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-6 p-4 bg-white rounded-lg shadow-sm border border-brand-rose/10">
                <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded-md border border-gray-100" />
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-lg font-medium text-brand-charcoal">{item.name}</h3>
                    <p className="text-sm text-brand-rose mt-1">Size: <span className="font-semibold">{item.size}</span></p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm text-brand-charcoal/60">Qty:</span>
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center text-brand-charcoal hover:bg-gray-50 disabled:opacity-50">-</button>
                        <div className="w-8 text-center text-sm font-medium">{item.quantity}</div>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-brand-charcoal hover:bg-gray-50">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <p className="font-semibold text-brand-burgundy">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm" title="Remove Item">
                      <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-80 flex-shrink-0">
            <div className="bg-brand-rose/5 p-6 rounded-lg border border-brand-rose/20 sticky top-24">
              <h2 className="text-xl font-serif text-brand-burgundy mb-4">Order Summary</h2>
              
              <div className="flex justify-between text-brand-charcoal mb-2">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              
              {/* DYNAMIC SHIPPING UI */}
              <div className="flex justify-between text-brand-charcoal mb-4 pb-4 border-b border-brand-rose/20">
                <span>Shipping</span>
                {subtotal >= 1000 ? (
                  <span><span className="line-through text-gray-400 mr-2">₹100</span><span className="text-green-600 font-medium">Free</span></span>
                ) : (
                  <span>₹100</span>
                )}
              </div>
              
              <div className="flex justify-between text-xl font-semibold text-brand-burgundy mb-8">
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString("en-IN")}</span>
              </div>
              
              <Link href="/checkout" className="w-full bg-brand-burgundy text-white py-4 rounded-full flex items-center justify-center text-lg hover:bg-brand-charcoal transition-colors shadow-md font-medium">
                Checkout
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <p className="text-center text-xs text-brand-charcoal/60 mt-4">Secure payment via UPI on the next step.</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}