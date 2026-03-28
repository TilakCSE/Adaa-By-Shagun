"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import Link from "next/link";
import { Package, AlertCircle, Phone } from "lucide-react";

interface Order {
  id: string; totalAmount: number; paymentStatus: string; orderStatus: string; createdAt: string;
  items: { name: string; size: string; quantity: number; image?: string }[];
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const q = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center">Loading orders...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-[70vh]">
      <h1 className="text-4xl font-serif text-brand-burgundy mb-8 border-b pb-4">My Orders</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Order List */}
        <div className="lg:col-span-2 space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
              <Link href="/shop" className="text-brand-rose font-medium hover:underline">Start Shopping</Link>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-xl shadow-sm border border-brand-rose/20">
                <div className="flex flex-wrap justify-between border-b pb-4 mb-4 text-sm text-gray-600 gap-4">
                  <div>
                    <span className="block font-medium">Order Placed</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="block font-medium">Total</span>
                    <span>₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block font-medium">Order ID</span>
                    <span className="font-mono">{order.id}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === "Delivered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-16 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-brand-charcoal">{item.name}</p>
                        <p className="text-sm text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: Policies Panel */}
        <div className="space-y-6">
          <div className="bg-brand-rose/5 p-6 rounded-xl border border-brand-rose/20">
            <h3 className="font-serif text-brand-burgundy text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> Cancellations & Returns
            </h3>
            <p className="text-sm text-brand-charcoal/80 leading-relaxed mb-4 text-justify">
              To request a cancellation, return, or replacement, please call our support team directly. We will verify your order status and assist you with the refund or exchange process immediately.
            </p>
            <div className="bg-white p-4 rounded-lg border border-brand-rose/10 flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-rose" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase">Support Number</p>
                <p className="font-semibold text-brand-burgundy">+91 9054549199</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              * For any other queries, you can also reach us at contact.adaabyshagun@gmail.com
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}