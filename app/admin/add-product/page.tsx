"use client";

import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db, storage, auth } from "@/lib/firebase"; // <-- Added auth
import { onAuthStateChanged } from "firebase/auth"; // <-- Added onAuthStateChanged
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud, Plus, X } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  
  // --- ADMIN BOUNCER ---
  const [loadingAuth, setLoadingAuth] = useState(true);
  const adminEmails = ["contact.adaabyshagun@gmail.com"];

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

      // --- NEW CLOUDINARY UPLOAD LOGIC ---
      if (imageFiles && imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const formData = new FormData();
          formData.append("file", file);
          
          // REPLACE "your_upload_preset" and "your_cloud_name" with your actual Cloudinary details
          formData.append("upload_preset", "adaa_products"); 
          
          const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/dj58kcrej/image/upload`, 
            {
              method: "POST",
              body: formData,
            }
          );

          const cloudinaryData = await cloudinaryResponse.json();
          uploadedImageUrls.push(cloudinaryData.secure_url); // Get the live URL back
        }
      }
      // ------------------------------------

      // Save to Firebase Database just like before, using the new URLs!
      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        stock: Number(stock),
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
      alert("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };
}