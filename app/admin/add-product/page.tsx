"use client";

import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase"; // <-- Added auth
import { onAuthStateChanged } from "firebase/auth"; // <-- Added onAuthStateChanged
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Plus, X } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  
  // --- ADMIN BOUNCER ---
  const [loadingAuth, setLoadingAuth] = useState(true);
  const adminEmails = ["admin@test.com", "contact.adaabyshagun@gmail.com"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If no user, no email, or email isn't in our admin list -> Kick to Home
      if (!user || !user.email || !adminEmails.includes(user.email.toLowerCase())) {
        router.push("/"); 
      } else {
        setLoadingAuth(false); // Let them in
      }
    });
    return () => unsubscribe();
  }, [router]);
  // ---------------------

  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("10"); // <-- NEW: Stock State
  const [description, setDescription] = useState("");
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  
  // Category State
  const [category, setCategory] = useState("Kurta Sets");
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Expanded Sizes State
  const [sizes, setSizes] = useState({
    XS: true, S: true, M: true, L: true, XL: true, "2XL": true, "3XL": true, "4XL": true
  });

  const handleToggleSize = (size: keyof typeof sizes) => {
    setSizes(prev => ({ ...prev, [size]: !prev[size] }));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const finalCategory = isAddingNewCategory && newCategory.trim() !== "" 
      ? newCategory.trim() 
      : category;

    try {
      const uploadedImageUrls: string[] = [];

      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileRef = ref(storage, `products/${Date.now()}-${file.name}`);
          await uploadBytes(fileRef, file);
          const downloadUrl = await getDownloadURL(fileRef);
          uploadedImageUrls.push(downloadUrl);
        }
      }

      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        stock: Number(stock), // <-- NEW: Save stock to database
        category: finalCategory,
        description,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ["https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80"],
        sizes,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      
      router.push("/admin"); 
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to add product. Please check your network and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Don't show the page until we verify they are an admin
  if (loadingAuth) return <div className="min-h-[70vh] flex items-center justify-center">Verifying Access...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/admin" className="inline-flex items-center text-sm text-brand-charcoal hover:text-brand-rose mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-brand-rose/20">
        <h1 className="text-3xl font-serif text-brand-burgundy mb-8 border-b border-brand-rose/20 pb-4">Add New Product</h1>

        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">Product Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200" placeholder="e.g. Silk Anarkali" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">Price (₹)</label>
              <input type="number" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200" placeholder="e.g. 2999" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DYNAMIC CATEGORY SELECTOR */}
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">Category</label>
              {isAddingNewCategory ? (
                <div className="flex gap-2">
                  <input 
                    type="text" required value={newCategory} onChange={(e) => setNewCategory(e.target.value)} 
                    className="flex-grow px-4 py-3 rounded-md border border-brand-rose focus:outline-none focus:ring-1 focus:ring-brand-rose" 
                    placeholder="Type new category" 
                  />
                  <button type="button" onClick={() => setIsAddingNewCategory(false)} className="px-4 py-3 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex-grow px-4 py-3 rounded-md border border-gray-200">
                    <option value="Kurta Sets">Kurta Sets</option>
                    <option value="Anarkali">Anarkali</option>
                    <option value="Sharara">Sharara</option>
                    <option value="Suit Sets">Suit Sets</option>
                  </select>
                  <button type="button" onClick={() => setIsAddingNewCategory(true)} className="flex items-center gap-2 px-4 py-3 bg-brand-rose/10 text-brand-burgundy rounded-md hover:bg-brand-rose/20 transition-colors font-medium whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Add Custom
                  </button>
                </div>
              )}
            </div>
            
            {/* NEW: STOCK INPUT */}
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-2">Total Stock (Units)</label>
              <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200" placeholder="e.g. 10" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-2">Upload Product Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <UploadCloud className="w-10 h-10 text-brand-rose/60 mb-3" />
              <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(e.target.files)} className="w-full max-w-xs text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-rose/10 file:text-brand-burgundy hover:file:bg-brand-rose/20 cursor-pointer" />
              <p className="text-xs text-gray-400 mt-2">Select photos directly from your device.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-2">Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 rounded-md border border-gray-200 h-32" placeholder="Describe the fabric, work, and fit..." />
          </div>

          {/* EXPANDED SIZES */}
          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-3">Available Sizes (Click to disable out-of-stock sizes)</label>
            <div className="flex flex-wrap gap-3">
              {Object.entries(sizes).map(([size, inStock]) => (
                <button
                  type="button" key={size} onClick={() => handleToggleSize(size as keyof typeof sizes)}
                  className={`w-12 h-12 rounded-full border transition-all text-sm font-medium ${
                    inStock ? "bg-brand-burgundy text-white border-brand-burgundy" : "bg-gray-100 text-gray-400 border-gray-200 line-through"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-brand-rose text-white py-4 rounded-md hover:bg-brand-burgundy transition-colors font-medium text-lg mt-8">
            {loading ? "Uploading Images & Saving..." : "Publish Product"}
          </button>
        </form>
      </div>
    </div>
  );
}