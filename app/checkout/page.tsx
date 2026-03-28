"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone, Info } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const subtotal = getCartTotal();

  const businessUpiId = "shagun123@upi"; 
  const businessName = "Adaa By Shagun";

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // 'guest' is default. Will update if logged in.
  const [userId, setUserId] = useState<string>("guest"); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string, total: number } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "", phone: "", address: "", city: "", state: "Gujarat", pincode: "",
  });

  useEffect(() => {
    setMounted(true);
    
    // Check auth, but DON'T redirect if they aren't logged in!
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserId(user.uid);
        
        // Auto-fill their saved address if they have one!
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            fullName: data.fullName || "",
            phone: data.phone || "",
            address: data.savedAddress?.address || "",
            city: data.savedAddress?.city || "",
            state: data.savedAddress?.state || "Gujarat",
            pincode: data.savedAddress?.pincode || "",
          });
        }
      }
    });

    if (mounted && cartItems.length === 0 && !placedOrder) {
      router.push("/cart");
    }
    return () => unsubscribe();
  }, [mounted, cartItems, router, placedOrder]);

  if (!mounted) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const proceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = {
        userId: userId, // Will be "guest" or their actual ID
        items: cartItems,
        totalAmount: subtotal,
        shippingAddress: formData,
        paymentMethod: "UPI",
        paymentStatus: "Pending Verification", 
        orderStatus: "Processing",
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setPlacedOrder({ id: docRef.id, total: subtotal });
      clearCart();
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const upiUrl = `upi://pay?pa=${businessUpiId}&pn=${encodeURIComponent(businessName)}&am=${subtotal}&cu=INR`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  // SUCCESS SCREEN
  if (placedOrder) {
    const whatsappMsg = `Hi Adaa by Shagun! I just placed an order with Order ID: ${placedOrder.id} for ₹${placedOrder.total}. Please verify my UPI payment.`;
    
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center min-h-[70vh] flex flex-col justify-center items-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />
        <h1 className="text-4xl font-serif text-brand-burgundy mb-4">Order Placed Successfully!</h1>
        <p className="text-brand-charcoal/80 text-lg mb-4">Order ID: <span className="font-mono font-bold">{placedOrder.id}</span></p>
        <p className="text-brand-charcoal/80 mb-8 max-w-lg">
          Thank you for shopping with us! We will verify your payment and process your order shortly.
        </p>
        
        <a 
          href={`https://wa.me/919054549199?text=${encodeURIComponent(whatsappMsg)}`}
          target="_blank" rel="noopener noreferrer"
          className="bg-[#25D366] text-white px-8 py-4 rounded-full font-medium hover:bg-[#1DA851] transition-colors shadow-lg mb-6 flex items-center gap-2"
        >
          <Smartphone className="w-5 h-5" /> Confirm Order via WhatsApp
        </a>

        <div className="flex gap-4">
          {isLoggedIn && <Link href="/orders" className="text-brand-burgundy font-medium hover:underline">View My Orders</Link>}
          <Link href="/shop" className="text-brand-rose font-medium hover:underline">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 min-h-[75vh]">
      <button onClick={() => step === 2 ? setStep(1) : router.push("/cart")} className="inline-flex items-center text-sm text-brand-charcoal hover:text-brand-rose mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> {step === 2 ? "Back to Address" : "Back to Cart"}
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-grow">
          {step === 1 ? (
             <div className="bg-white p-8 rounded-xl shadow-sm border border-brand-rose/20">
             
             {/* GUEST CHECKOUT RECOMMENDATION */}
             {!isLoggedIn && (
               <div className="bg-brand-rose/10 text-brand-burgundy p-4 rounded-lg border border-brand-rose/30 flex items-start gap-3 mb-8">
                 <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                 <div>
                   <p className="font-medium">Want to track your order easily?</p>
                   <p className="text-sm mt-1 opacity-80">You are checking out as a guest. <Link href="/login?redirect=checkout" className="underline font-bold">Log in</Link> or <Link href="/register" className="underline font-bold">Create an account</Link> to save your details and track your package later!</p>
                 </div>
               </div>
             )}

             <h2 className="text-2xl font-serif text-brand-burgundy mb-6 border-b border-brand-rose/20 pb-4">Shipping Details</h2>
             <form onSubmit={proceedToPayment} className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-brand-charcoal mb-2">Full Name</label>
                   <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-200" placeholder="Jane Doe" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-brand-charcoal mb-2">Phone Number</label>
                   <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-200" placeholder="+91 9876543210" />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-brand-charcoal mb-2">Complete Address</label>
                 <input type="text" name="address" required value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-200" placeholder="House/Flat No., Street Name, Area" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                   <label className="block text-sm font-medium text-brand-charcoal mb-2">City</label>
                   <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-200" placeholder="Vadodara" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-brand-charcoal mb-2">State</label>
                   <input type="text" name="state" required value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-200" />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-brand-charcoal mb-2">Pincode</label>
                   <input type="text" name="pincode" required value={formData.pincode} onChange={handleInputChange} className="w-full px-4 py-3 rounded-md border border-gray-200" placeholder="390024" />
                 </div>
               </div>
               <button type="submit" className="w-full bg-brand-rose text-white py-4 rounded-md hover:bg-brand-burgundy transition-colors font-medium text-lg mt-4">
                 Proceed to Payment
               </button>
             </form>
           </div>
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-brand-rose/20 text-center">
              <h2 className="text-2xl font-serif text-brand-burgundy mb-2">Secure UPI Payment</h2>
              <div className="text-2xl font-semibold text-brand-burgundy mb-6">Amount to Pay: ₹{subtotal.toLocaleString("en-IN")}</div>

              {/* MOBILE TAP-TO-PAY */}
              <div className="md:hidden flex flex-col gap-3 mb-8">
                <a href={upiUrl} className="bg-black text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                  Tap to Pay via GPay / PhonePe / Paytm
                </a>
              </div>

              {/* DESKTOP QR CODE */}
              <div className="hidden md:block mb-8">
                <p className="text-brand-charcoal/70 mb-4">Scan the QR code below using any UPI app.</p>
                <div className="p-4 border-2 border-brand-rose/30 rounded-xl bg-white shadow-sm inline-block">
                  <img src={qrCodeImageUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto" />
                </div>
                <p className="text-sm text-brand-charcoal/60 mt-4">UPI ID: {businessUpiId}</p>
              </div>

              <div className="bg-brand-rose/5 border border-brand-rose/20 p-4 rounded-lg text-left mb-8 flex gap-3">
                <ShieldCheck className="w-6 h-6 text-brand-burgundy flex-shrink-0" />
                <p className="text-sm text-brand-charcoal/80">
                  After completing the payment on your app, click the button below. 
                </p>
              </div>

              <button 
                onClick={handlePlaceOrder} disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-md hover:bg-green-700 transition-colors font-medium text-lg shadow-md"
              >
                {loading ? "Processing..." : "I have completed the payment"}
              </button>
            </div>
          )}
        </div>

        {/* SUMMARY COLUMN */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-brand-cream/50 p-6 rounded-xl border border-brand-rose/20 sticky top-24">
            <h3 className="text-lg font-serif text-brand-burgundy mb-4 border-b border-brand-rose/20 pb-2">Order Summary</h3>
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <div className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded border border-gray-200" />
                    <div>
                      <p className="font-medium text-brand-charcoal line-clamp-1">{item.name}</p>
                      <p className="text-brand-charcoal/60">Size: {item.size} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-brand-rose/20 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-brand-charcoal"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between text-brand-charcoal"><span>Shipping</span><span className="text-green-600">Free</span></div>
              <div className="flex justify-between text-lg font-semibold text-brand-burgundy pt-2 border-t border-brand-rose/20 mt-2">
                <span>Total</span><span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}