"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase"; // <-- Added auth
import { onAuthStateChanged } from "firebase/auth"; // <-- Added onAuthStateChanged
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  // --- ADMIN BOUNCER ---
  const [loadingAuth, setLoadingAuth] = useState(true);
  const adminEmails = ["admin@test.com", "contact.adaabyshagun@gmail.com"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !user.email || !adminEmails.includes(user.email.toLowerCase())) {
        router.push("/"); 
      } else {
        setLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);
  // ---------------------

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10"); // <-- NEW: Stock State
  const [category, setCategory] = useState("Kurta Sets");
  const [description, setDescription] = useState("");
  const [sizes, setSizes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Only fetch product if auth is verified to prevent errors
    if (loadingAuth) return;

    const fetchProduct = async () => {
      try {
        const docSnap = await getDoc(doc(db, "products", productId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || "");
          setPrice(data.price?.toString() || "");
          setStock(data.stock?.toString() || "10"); // <-- NEW: Fetch existing stock
          setCategory(data.category || "");
          setDescription(data.description || "");
          setSizes(data.sizes || { XS: false, S: false, M: false, L: false, XL: false, "2XL": false, "3XL": false, "4XL": false });
        } else {
          alert("Product not found!");
          router.push("/admin");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, router, loadingAuth]); // <-- Added loadingAuth to dependencies

  const handleToggleSize = (size: string) => {
    setSizes(prev => ({ ...prev, [size]: !prev[size] }));
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, "products", productId), {
        name,
        price: Number(price),
        stock: Number(stock), // <-- NEW: Update stock in DB
        category,
        description,
        sizes,
      });
      router.push("/admin"); 
    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  // Check auth first, then data loading
  if (loadingAuth) return <div className="text-center py-20">Verifying Access...</div>;
  if (loading) return <div className="text-center py-20">Loading product data...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/admin" className="inline-flex items-center text-sm text-brand-charcoal hover:text-brand-rose mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-brand-rose/20">
        <h1 className="text-3xl font-serif text-brand-burgundy mb-8 border-b pb-4">Edit Product</h1>
        <form onSubmit={handleUpdateProduct} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm mb-2">Product Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm mb-2">Price (₹)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 border rounded-md" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm mb-2">Category</label>
              <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border rounded-md" />
            </div>
            {/* NEW: STOCK INPUT */}
            <div>
              <label className="block text-sm mb-2">Total Stock (Units)</label>
              <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-3 border rounded-md" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border rounded-md h-32" />
          </div>
          <div>
            <label className="block text-sm mb-3">Sizes (Click to toggle availability)</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(sizes).map(([size, inStock]) => (
                <button type="button" key={size} onClick={() => handleToggleSize(size)} className={`w-12 h-12 rounded-full border text-sm font-medium ${inStock ? "bg-brand-burgundy text-white" : "bg-gray-100 text-gray-400 line-through"}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-brand-rose text-white py-4 rounded-md mt-8 font-medium">
            {saving ? "Saving Changes..." : "Update Product"}
          </button>
        </form>
      </div>
    </div>
  );
}