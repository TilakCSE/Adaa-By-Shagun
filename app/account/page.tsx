"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore"; // Changed updateDoc to setDoc
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Package, LogOut, Trash2, ShieldAlert, MapPin, ShieldCheck } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // Address State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Gujarat");
  const [pincode, setPincode] = useState("");

  // Add your admin emails here!
  const adminEmails = ["admin@test.com", "contact.adaabyshagun@gmail.com"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUserUid(currentUser.uid);
        setEmail(currentUser.email || "");
        
        // Instantly check if they are an admin based on email
        if (currentUser.email && adminEmails.includes(currentUser.email)) {
          setIsAdmin(true);
        }
        
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFullName(data.fullName || "");
          setPhone(data.phone || "");
          
          if (data.savedAddress) {
            setAddress(data.savedAddress.address || "");
            setCity(data.savedAddress.city || "");
            setState(data.savedAddress.state || "Gujarat");
            setPincode(data.savedAddress.pincode || "");
          }
        }
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userUid) return;
    setSaving(true);
    try {
      // Using setDoc with merge: true FIXES the missing document error!
      await setDoc(doc(db, "users", userUid), {
        email: email, // ensure email is saved if it's a newly created doc
        fullName,
        phone,
        savedAddress: { address, city, state, pincode },
        role: isAdmin ? "admin" : "customer" // Ensure role is saved
      }, { merge: true });
      
      alert("Account details saved successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmDelete || !auth.currentUser || !userUid) return;
    try {
      await deleteDoc(doc(db, "users", userUid));
      await deleteUser(auth.currentUser);
      alert("Account deleted successfully.");
      router.push("/");
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log back in before deleting your account.");
      } else {
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  if (loading) return <div className="min-h-[70vh] flex items-center justify-center">Loading your profile...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[70vh]">
      <h1 className="text-4xl font-serif text-brand-burgundy mb-8 border-b border-brand-rose/20 pb-4">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT MENU */}
        <div className="space-y-4">
          
          {/* Admin Dashboard Link (Only visible to Admins) */}
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-3 bg-brand-burgundy text-white p-4 rounded-lg hover:bg-brand-charcoal transition-colors font-medium shadow-sm">
              <ShieldCheck className="w-5 h-5" /> Admin Dashboard
            </Link>
          )}

          {/* View Orders Link (Only visible to Regular Customers) */}
          {!isAdmin && (
            <Link href="/orders" className="flex items-center gap-3 bg-brand-rose/10 text-brand-burgundy p-4 rounded-lg hover:bg-brand-rose/20 transition-colors font-medium">
              <Package className="w-5 h-5" /> View My Orders
            </Link>
          )}
          
          <button onClick={handleLogout} className="w-full flex items-center gap-3 bg-gray-50 text-brand-charcoal border border-gray-200 p-4 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>

        {/* RIGHT CONTENT */}
        <div className="md:col-span-2 space-y-8">
          <form onSubmit={handleUpdateProfile} className="space-y-8">
            
            {/* Personal Info */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-brand-rose/20">
              <h2 className="text-xl font-serif text-brand-burgundy mb-6 flex items-center gap-2">
                <User className="w-5 h-5" /> Personal Information
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Email Address</label>
                  <input type="email" value={email} disabled className="w-full px-4 py-3 rounded-md border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed" />
                </div>
              </div>
            </div>

            {/* Saved Address */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-brand-rose/20">
              <h2 className="text-xl font-serif text-brand-burgundy mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5" /> Default Shipping Address
              </h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-2">Complete Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House/Flat No., Street Name" className="w-full px-4 py-3 rounded-md border border-gray-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-charcoal mb-2">City</label>
                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-charcoal mb-2">State</label>
                    <input type="text" value={state} onChange={(e) => setState(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-charcoal mb-2">Pincode</label>
                    <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200" />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={saving} className="bg-brand-burgundy text-white px-8 py-4 rounded-md hover:bg-brand-charcoal transition-colors font-medium text-lg w-full">
              {saving ? "Saving Changes..." : "Save All Changes"}
            </button>
          </form>

          {/* DANGER ZONE */}
          <div className="bg-red-50 p-8 rounded-xl border border-red-100 mt-12">
            <h2 className="text-xl font-serif text-red-700 mb-2 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> Danger Zone</h2>
            <p className="text-red-600/80 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <button onClick={handleDeleteAccount} className="bg-red-600 text-white px-6 py-3 rounded-md hover:bg-red-700 transition-colors font-medium flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete Account
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}