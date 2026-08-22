"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth/AuthModal";

const PROPERTY_TYPES = [
  "Plots & Land",
  "Apartments & Flats",
  "Houses & Villas",
  "Commercial Shops & Offices",
  "PG & Hostels",
  "Farm Houses",
  "Warehouses & Godown",
  "Agricultural Land",
];

const LISTING_TYPES = [
  "For Sale",
  "For Rent",
  "Commercial Lease",
  "PG",
];

const NORTHEAST_STATES = [
  "Assam",
  "Meghalaya",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Sikkim",
];

const ALL_AMENITIES = [
  "24x7 Water Supply",
  "Covered Car Parking",
  "Lift / Elevator",
  "Power Backup / Inverter",
  "24x7 Security / CCTV",
  "Gated Society",
  "Private Garden / Lawn",
  "Gym / Fitness Center",
  "Clubhouse",
  "Swimming Pool",
  "Modular Kitchen",
  "Balcony / Terrace",
  "Corner Plot",
  "Boundary Wall Done",
  "Road Facing (Main Road)",
  "Vaastu Compliant",
  "Pet Friendly",
  "Wi-Fi / High-Speed Internet",
];

export default function PostPropertyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("Apartments & Flats");
  const [listingType, setListingType] = useState("For Sale");
  const [price, setPrice] = useState("");
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [priceUnit, setPriceUnit] = useState("total"); // total, per_sqft, per_month
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areaSqFt, setAreaSqFt] = useState("");
  const [facing, setFacing] = useState("");
  const [furnishing, setFurnishing] = useState("Unfurnished");
  const [state, setState] = useState("Assam");
  const [city, setCity] = useState("Guwahati");
  const [locality, setLocality] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [postedBy, setPostedBy] = useState("Owner");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");

  // Selected Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    "24x7 Water Supply",
    "Covered Car Parking",
  ]);

  // Image Uploads
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchSession();
  }, []);

  async function fetchSession() {
    try {
      setLoadingUser(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        setContactName(data.user.fullName || data.user.name || data.user.username || "");
        setContactEmail(data.user.email || "");
        if (data.user.phone || data.user.mobileNumber) {
          const ph = data.user.phone || data.user.mobileNumber;
          setContactPhone(ph);
          setContactWhatsApp(ph);
        }
      }
    } catch {} finally {
      setLoadingUser(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);
      setErrorMsg("");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.status === "success" && data.url) {
          setImageUrls((prev) => [...prev, data.url]);
        }
      }
    } catch {
      setErrorMsg("Failed to upload photos. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  }

  function handleRemoveImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function toggleAmenity(am: string) {
    setSelectedAmenities((prev) =>
      prev.includes(am) ? prev.filter((a) => a !== am) : [...prev, am]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!title.trim() || !price || !state || !city) {
      setErrorMsg("Please fill in the title, price, state, and city.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          propertyType,
          listingType,
          price,
          priceNegotiable,
          priceUnit,
          bedrooms: bedrooms ? parseInt(bedrooms, 10) : null,
          bathrooms: bathrooms ? parseInt(bathrooms, 10) : null,
          areaSqFt: areaSqFt ? parseFloat(areaSqFt) : null,
          facing,
          furnishing,
          state,
          city,
          locality,
          address,
          pincode,
          imageUrls,
          amenities: selectedAmenities,
          postedBy,
          contactName,
          contactPhone,
          contactEmail,
          contactWhatsApp,
        }),
      });

      const data = await res.json();
      if (data.status === "success" && data.data) {
        setSuccessMsg("Property listed successfully! Redirecting...");
        setTimeout(() => {
          router.push(`/properties/${data.data.id}`);
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to list property");
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 pb-24 transition-colors">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-50/60 via-slate-50/80 to-white dark:from-emerald-950/40 dark:via-[#0c121e] dark:to-[#090d16] pt-8 pb-8 border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/properties" className="hover:text-emerald-600">
              Properties
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-slate-100 font-bold">Post Property</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            🏡 List Your Property Free
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Reach thousands of genuine buyers and tenants across Assam and all 8 Northeast states with zero commission.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-4xl mt-6">
        {!loadingUser && !currentUser && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-extrabold text-amber-800 dark:text-amber-200 block">
                🔐 Login Required to Post
              </span>
              <span className="text-amber-700 dark:text-amber-300">
                Please log in to manage your property listings and receive direct buyer inquiries.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shrink-0"
            >
              Log In / Sign Up
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic Property Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span>📍</span>
              <span>1. Basic Property Info & Category</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Listing Type *
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {LISTING_TYPES.map((lt) => (
                    <option key={lt} value={lt}>
                      {lt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Property Category *
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100"
                >
                  {PROPERTY_TYPES.map((pt) => (
                    <option key={pt} value={pt}>
                      {pt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Property Title / Headline *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 3 BHK Luxury Flat with Modular Kitchen in Beltola, Guwahati"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your property specifications, neighborhood advantages, nearest landmarks, road width, society features, water/electricity status..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 2. Price & Specifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span>💰</span>
              <span>2. Price & Physical Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Expected Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 6500000 or 18000"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-emerald-600 dark:text-emerald-400 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Price Unit / Structure
                </label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                >
                  <option value="total">Total Price</option>
                  <option value="per_sqft">Per Sq. Ft.</option>
                  <option value="per_month">Per Month (Rent)</option>
                  <option value="per_year">Per Year (Lease)</option>
                </select>
              </div>

              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={priceNegotiable}
                    onChange={(e) => setPriceNegotiable(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Price is Negotiable</span>
                </label>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bedrooms (BHK)
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">N/A (Plot/Commercial)</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bathrooms
                </label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">N/A</option>
                  <option value="1">1 Bathroom</option>
                  <option value="2">2 Bathrooms</option>
                  <option value="3">3 Bathrooms</option>
                  <option value="4">4+ Bathrooms</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Super Built-up Area (Sq. Ft)
                </label>
                <input
                  type="number"
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(e.target.value)}
                  placeholder="e.g. 1350"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Furnishing Status
                </label>
                <select
                  value={furnishing}
                  onChange={(e) => setFurnishing(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Facing / Direction
                </label>
                <select
                  value={facing}
                  onChange={(e) => setFacing(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                >
                  <option value="">Not Specified</option>
                  <option value="North">North</option>
                  <option value="North-East">North-East (Ishan)</option>
                  <option value="East">East</option>
                  <option value="South-East">South-East</option>
                  <option value="South">South</option>
                  <option value="South-West">South-West</option>
                  <option value="West">West</option>
                  <option value="North-West">North-West</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  You are posting as
                </label>
                <select
                  value={postedBy}
                  onChange={(e) => setPostedBy(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  <option value="Owner">👤 Owner</option>
                  <option value="Agent / Broker">🏢 Agent / Broker</option>
                  <option value="Builder / Developer">🏗️ Builder / Developer</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Location Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span>📍</span>
              <span>3. Location & Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  State *
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
                >
                  {NORTHEAST_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Guwahati, Shillong, Dibrugarh"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Locality / Sector
                </label>
                <input
                  type="text"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. Beltola, Zoo Road, Laitumkhrah"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Address / Landmark
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near GNRC Hospital, Bye Lane 3"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 781028"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* 4. Amenities & Features */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span>✨</span>
              <span>4. Amenities & Features</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {ALL_AMENITIES.map((am) => {
                const checked = selectedAmenities.includes(am);
                return (
                  <button
                    key={am}
                    type="button"
                    onClick={() => toggleAmenity(am)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${
                      checked
                        ? "bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold"
                        : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span>{checked ? "☑️" : "⬜"}</span>
                    <span className="truncate">{am}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Photos Upload */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span>📷</span>
              <span>5. Upload Property Photos</span>
            </h2>

            <div className="space-y-4">
              <label className="block border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition">
                <span className="text-3xl block mb-2">📸</span>
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300 block">
                  {uploadingImage ? "Uploading photos to secure storage..." : "Click to Upload Photos from your device"}
                </span>
                <span className="text-[11px] text-slate-400">
                  Supported formats: JPG, PNG, WEBP (Max 5MB each)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 6. Contact Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
            <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <span>📞</span>
              <span>6. Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Partha Pratim"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  WhatsApp Number (For Direct Chats)
                </label>
                <input
                  type="tel"
                  value={contactWhatsApp}
                  onChange={(e) => setContactWhatsApp(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="contact@email.com"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{submitting ? "Publishing Property Listing..." : "Publish Property Listing Free 🚀"}</span>
            </button>
          </div>
        </form>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />
    </div>
  );
}
