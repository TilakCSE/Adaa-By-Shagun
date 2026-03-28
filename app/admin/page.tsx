"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Plus, LogOut, TrendingUp, CheckCircle, Clock, Eye, EyeOff, Trash2, Edit, X, MessageCircle, MapPin } from "lucide-react";

interface Product { id: string; name: string; price: number; category: string; images: string[]; isActive: boolean; }
interface Order {
  id: string; totalAmount: number; paymentStatus: string; orderStatus: string; createdAt: string;
  shippingAddress: { fullName: string; phone: string; address: string; city: string; state: string; pincode: string; };
  items: { name: string; size: string; quantity: number; price: number }[];
  notificationHistory?: { type: string; timestamp: string }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- THE NEW BOUNCER ---
  // Only this email is allowed in!
  const adminEmails = ["contact.adaabyshagun@gmail.com"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || !currentUser.email || !adminEmails.includes(currentUser.email.toLowerCase())) {
        // Not logged in or not an admin? Kick them to the home page!
        router.push("/");
      } else {
        // They are the admin! Let them in and fetch the data.
        setUser(currentUser);
        setLoadingAuth(false);
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchData = async () => {
    try {
      const pSnap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
      setProducts(pSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
      const oSnap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
      setOrders(oSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    } catch (e) { 
      console.error("Error fetching data:", e); 
    } finally { 
      setLoadingData(false); 
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, field: "paymentStatus" | "orderStatus", value: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { [field]: value });
      fetchData(); // Refresh list
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, [field]: value } : null);
      }
    } catch (e) { alert("Failed to update status."); }
  };

  const handleNotifyCustomer = async (order: Order, type: "Processing" | "Shipped" | "Delivered") => {
    const phone = order.shippingAddress.phone.replace(/\D/g, ''); // Clean phone number
    let message = "";
    
    if (type === "Processing") message = `Hi ${order.shippingAddress.fullName}, your payment of ₹${order.totalAmount} is verified! We are processing your order from Adaa by Shagun.`;
    if (type === "Shipped") message = `Great news ${order.shippingAddress.fullName}! Your Adaa by Shagun order has been SHIPPED and is on its way to your shipping address.`;
    if (type === "Delivered") message = `Hi ${order.shippingAddress.fullName}, your order from Adaa by Shagun has been marked as DELIVERED. We hope you love it!`;

    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`, "_blank");

    try {
      const newNotification = { type, timestamp: new Date().toISOString() };
      await updateDoc(doc(db, "orders", order.id), {
        notificationHistory: arrayUnion(newNotification)
      });
      fetchData(); 
      setSelectedOrder(prev => prev ? { ...prev, notificationHistory: [...(prev.notificationHistory || []), newNotification] } : null);
    } catch (e) { console.error("Failed to save history"); }
  };

  const handleToggleProduct = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "products", id), { isActive: !current }); fetchData();
  };
  const handleDeleteProduct = async (id: string) => {
    if (confirm("Delete this product permanently?")) { await deleteDoc(doc(db, "products", id)); fetchData(); }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Safely show a loading screen while checking auth (PREVENTS WHITE SCREEN)
  if (loadingAuth) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-rose border-t-brand-burgundy rounded-full animate-spin mb-4"></div>
        <p className="text-brand-charcoal animate-pulse">Verifying secure access...</p>
      </div>
    );
  }

  // If the user isn't set for some reason, don't try to render the page to avoid crashes
  if (!user) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-brand-burgundy mb-1">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Logged in as: {user.email}</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Link href="/admin/add-product" className="bg-brand-rose text-white px-4 py-2 rounded-md hover:bg-brand-burgundy font-medium text-sm flex-grow sm:flex-grow-0 text-center whitespace-nowrap">
            + Add Product
          </Link>
          <button onClick={handleLogout} className="border px-4 py-2 rounded-md hover:bg-gray-50 text-sm flex-grow sm:flex-grow-0 whitespace-nowrap">
            Logout
          </button>
        </div>

      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("orders")} className={`px-6 py-3 rounded-t-lg font-medium border-b-2 ${activeTab === "orders" ? "border-brand-burgundy text-brand-burgundy bg-brand-rose/5" : "border-transparent text-gray-500"}`}>Orders ({orders.length})</button>
        <button onClick={() => setActiveTab("inventory")} className={`px-6 py-3 rounded-t-lg font-medium border-b-2 ${activeTab === "inventory" ? "border-brand-burgundy text-brand-burgundy bg-brand-rose/5" : "border-transparent text-gray-500"}`}>Inventory ({products.length})</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border min-h-[400px]">
        {loadingData ? <div className="p-10 text-center text-gray-500">Loading database records...</div> : 
         activeTab === "orders" ? (
          orders.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-sm text-gray-600">
                    <th className="px-6 py-4">Order ID / Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm">
                        <span className="font-mono text-xs block text-gray-400">{order.id}</span>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-brand-burgundy">{order.shippingAddress.fullName}</div>
                        <div className="text-sm text-gray-500">₹{order.totalAmount.toLocaleString("en-IN")}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm mb-1">{order.paymentStatus === "Verified" ? <span className="text-green-600 font-medium">₹ Verified</span> : <span className="text-amber-600 font-medium">UPI Pending</span>}</div>
                        <div className="text-xs bg-gray-100 inline-block px-2 py-1 rounded">{order.orderStatus}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => setSelectedOrder(order)} className="bg-brand-rose/10 text-brand-burgundy px-4 py-2 rounded-md hover:bg-brand-rose/20 text-sm font-medium transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
         ) : (
          products.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No products found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b text-sm text-gray-600"><th className="px-6 py-4">Product</th><th className="px-6 py-4">Price</th><th className="px-6 py-4">Actions</th></tr>
                </thead>
                <tbody className="divide-y">
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className="px-6 py-4 flex items-center gap-4">
                        <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded object-cover" />
                        <div>
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-gray-400 block">{p.isActive ? 'Active' : 'Hidden'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">₹{p.price.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 space-x-4">
                        <button onClick={() => handleToggleProduct(p.id, p.isActive)} title="Toggle Visibility">{p.isActive ? <EyeOff className="w-5 h-5 inline text-gray-500"/> : <Eye className="w-5 h-5 inline text-gray-500"/>}</button>
                        <Link href={`/admin/edit-product/${p.id}`}><Edit className="w-5 h-5 inline text-blue-500"/></Link>
                        <button onClick={() => handleDeleteProduct(p.id)}><Trash2 className="w-5 h-5 inline text-red-500"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
         )}
      </div>

      {/* --- ORDER DETAILS MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-serif text-brand-burgundy">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 space-y-8">
              {/* Order Meta & Status Dropdowns */}
              <div className="grid grid-cols-2 gap-6 bg-brand-rose/5 p-4 rounded-lg border border-brand-rose/20">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Payment Status</label>
                  <select 
                    value={selectedOrder.paymentStatus} 
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, "paymentStatus", e.target.value)}
                    className={`w-full p-2 rounded border text-sm font-medium ${selectedOrder.paymentStatus === "Verified" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                  >
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Verified">Verified (Paid)</option>
                    <option value="Failed/Refunded">Failed/Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Shipping Status</label>
                  <select 
                    value={selectedOrder.orderStatus} 
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, "orderStatus", e.target.value)}
                    className="w-full p-2 rounded border text-sm bg-white"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Customer & Delivery</h3>
                <div className="bg-gray-50 p-4 rounded-lg flex items-start gap-4">
                  <MapPin className="text-brand-rose w-5 h-5 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-brand-charcoal/70">📞 {selectedOrder.shippingAddress.phone}</p>
                    <p className="text-brand-charcoal/70 mt-2">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-brand-charcoal/70">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Items Ordered</h3>
                <div className="border rounded-lg divide-y">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center bg-white text-sm">
                      <div><span className="font-medium">{item.quantity}x</span> {item.name} <span className="text-brand-rose font-medium text-xs ml-2">Size: {item.size}</span></div>
                      <div className="font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</div>
                    </div>
                  ))}
                  <div className="p-3 bg-gray-50 flex justify-between items-center font-bold text-brand-burgundy">
                    <span>Total Paid</span>
                    <span>₹{selectedOrder.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Tracking & Notifications */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2"><MessageCircle className="w-4 h-4"/> Notify Customer via WhatsApp</h3>
                
                <div className="flex flex-wrap gap-3 mb-4">
                  <button onClick={() => handleNotifyCustomer(selectedOrder, "Processing")} className="bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30 px-4 py-2 rounded-full text-sm font-medium hover:bg-[#25D366]/20 transition-colors">Send "Verified & Processing"</button>
                  <button onClick={() => handleNotifyCustomer(selectedOrder, "Shipped")} className="bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30 px-4 py-2 rounded-full text-sm font-medium hover:bg-[#25D366]/20 transition-colors">Send "Shipped"</button>
                  <button onClick={() => handleNotifyCustomer(selectedOrder, "Delivered")} className="bg-[#25D366]/10 text-[#075E54] border border-[#25D366]/30 px-4 py-2 rounded-full text-sm font-medium hover:bg-[#25D366]/20 transition-colors">Send "Delivered"</button>
                </div>

                {/* History Log */}
                <div className="bg-gray-50 border rounded-lg p-4 text-sm">
                  <p className="font-semibold text-gray-600 mb-2">Message History:</p>
                  {selectedOrder.notificationHistory && selectedOrder.notificationHistory.length > 0 ? (
                    <ul className="space-y-2">
                      {selectedOrder.notificationHistory.map((log, idx) => (
                        <li key={idx} className="flex gap-2 text-gray-500">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>Sent <b>{log.type}</b> notification on {new Date(log.timestamp).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-400 italic">No messages sent yet.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}