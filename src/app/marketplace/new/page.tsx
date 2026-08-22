"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import {
  NORTHEAST_LOCATIONS,
  NE_STATE_NAMES,
  getCitiesForState,
  getLocalitiesForCity,
} from "@/lib/locations";

const CATEGORIES = [
  "Vehicles & Bikes",
  "Mobiles & Electronics",
  "Properties & Rent",
  "Handlooms & Crafts",
  "Tea & Agro Products",
  "Furniture & Decor",
  "Pets & Livestock",
  "Fashion & Lifestyle",
  "Home & Local Services",
  "Books & Hobbies",
  "Others",
];

export default function PostMarketplaceAdPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Base Fields
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [price, setPrice] = useState("");
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [state, setState] = useState("Assam");
  const [city, setCity] = useState("Guwahati");
  const [locality, setLocality] = useState("GS Road");
  const [customLocality, setCustomLocality] = useState("");
  const [customCity, setCustomCity] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");

  // Photo Upload States
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Dynamic Category-Specific States
  // General Item Condition
  const [itemCondition, setItemCondition] = useState("Good");

  // Vehicles
  const [vehicleType, setVehicleType] = useState("Car");
  const [fuelType, setFuelType] = useState("Petrol");
  const [transmission, setTransmission] = useState("Manual");
  const [modelYear, setModelYear] = useState("2022");

  // Jobs & Services
  const [jobType, setJobType] = useState("Full-time");
  const [experienceLevel, setExperienceLevel] = useState("Fresher / Any");
  const [salaryPeriod, setSalaryPeriod] = useState("Per Month");

  // Properties & Rent
  const [propertyType, setPropertyType] = useState("Apartment / Flat for Rent");
  const [bhk, setBhk] = useState("2 BHK");
  const [furnishing, setFurnishing] = useState("Semi-Furnished");

  // Pets & Livestock
  const [petType, setPetType] = useState("Dogs & Puppies");
  const [breedOrAge, setBreedOrAge] = useState("");

  // Tea & Agro Products
  const [agroType, setAgroType] = useState("Organic Assam CTC / Orthodox Tea");
  const [quantityUnit, setQuantityUnit] = useState("Per Kg");

  // Handlooms & Crafts
  const [fabricType, setFabricType] = useState("Pure Muga Silk");
  const [craftCondition, setCraftCondition] = useState("Brand New (Handwoven)");

  useEffect(() => {
    fetchMe();
  }, []);

  async function fetchMe() {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.status === "success" && data.user) {
        setCurrentUser(data.user);
        if (data.user.mobileNumber) {
          setContactPhone(data.user.mobileNumber);
          setContactWhatsApp(data.user.mobileNumber);
        }
        if (data.user.state) setState(data.user.state);
        if (data.user.city) setCity(data.user.city);
      } else {
        setAuthModalOpen(true);
      }
    } catch {
      setAuthModalOpen(true);
    } finally {
      setLoading(false);
    }
  }

  // Upload handler for files
  async function handleFilesUpload(filesList: FileList | File[]) {
    if (!filesList || filesList.length === 0) return;

    try {
      setIsUploading(true);
      setErrorMsg("");

      const formData = new FormData();
      Array.from(filesList).forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to upload images");

      if (data.urls && data.urls.length > 0) {
        setUploadedImages((prev) => [...prev, ...data.urls]);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleAddManualUrl(e: React.FormEvent) {
    e.preventDefault();
    if (manualUrl.trim()) {
      setUploadedImages((prev) => [...prev, manualUrl.trim()]);
      setManualUrl("");
      setShowUrlInput(false);
    }
  }

  function removeImage(indexToRemove: number) {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  // Compute final stored condition/specification string based on category
  function getComputedConditionString() {
    switch (category) {
      case "Jobs & Services":
        return `${jobType} • ${experienceLevel} • ${salaryPeriod}`;
      case "Properties & Rent":
        return `${propertyType} • ${bhk} • ${furnishing}`;
      case "Vehicles & Bikes":
        return `${itemCondition} • ${fuelType} • ${transmission} • ${modelYear}`;
      case "Pets & Livestock":
        return `${petType}${breedOrAge ? ` (${breedOrAge})` : ""}`;
      case "Tea & Agro Products":
        return `${agroType} • ${quantityUnit}`;
      case "Handlooms & Crafts":
        return `${craftCondition} • ${fabricType}`;
      default:
        return itemCondition;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    if (!title.trim() || !description.trim() || !price || !category || !state || !city.trim()) {
      setErrorMsg("Please fill in all required fields (Title, Price/Salary, State, City, Description).");
      return;
    }

    const computedCondition = getComputedConditionString();
    const finalImageUrls = uploadedImages.join(",");
    const finalCity = city === "Other City" && customCity.trim() ? customCity.trim() : city;
    const finalLocality =
      locality === "Other Locality / Area" && customLocality.trim()
        ? customLocality.trim()
        : locality;

    if (!finalCity) {
      setErrorMsg("Please select or enter a valid city / town.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: category.trim(),
          price: parseFloat(price),
          isNegotiable,
          condition: computedCondition,
          state: state.trim(),
          city: finalCity.trim(),
          locality: finalLocality?.trim() || null,
          description: description.trim(),
          imageUrls: finalImageUrls || null,
          contactPhone: contactPhone.trim() || null,
          contactWhatsApp: contactWhatsApp.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post ad");

      router.push(`/marketplace/${data.listing.id}`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/marketplace"
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 mb-1"
            >
              &larr; Back to Marketplace
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight">
              Post an Ad / Listing
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Reach thousands of verified buyers across Assam and Northeast India (+30 Explorer XP)
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-3.5 py-1.5 rounded-2xl text-xs font-bold">
            <span>✨</span> +30 XP Reward
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-950/70 border border-rose-800 rounded-2xl text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Category & Dynamic Fields */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>🏷️</span> Category &amp; Specific Details
            </h2>

            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs md:text-sm outline-none focus:border-emerald-500 focus:bg-slate-900 font-bold cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* DYNAMIC CATEGORY FIELDS */}

            {/* 1. JOBS & SERVICES */}
            {category === "Jobs & Services" && (
              <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>💼</span> Job &amp; Service Specifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Job Type / Role
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 font-medium cursor-pointer"
                    >
                      <option value="Full-time">Full-time Employee</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract / Freelance">Contract / Freelance</option>
                      <option value="Work from Home / Remote">Work from Home / Remote</option>
                      <option value="Local Service / Skilled Work">Local Service / Skilled Work</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Experience Required
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 font-medium cursor-pointer"
                    >
                      <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                      <option value="1-3 Years Experience">1-3 Years Experience</option>
                      <option value="3-5 Years Experience">3-5 Years Experience</option>
                      <option value="5+ Years Senior">5+ Years Senior</option>
                      <option value="Not Applicable">Not Applicable</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Payment Frequency
                    </label>
                    <select
                      value={salaryPeriod}
                      onChange={(e) => setSalaryPeriod(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 font-medium cursor-pointer"
                    >
                      <option value="Per Month">Monthly Salary</option>
                      <option value="Per Day">Daily Rate</option>
                      <option value="Fixed Project">Fixed Project Fee</option>
                      <option value="Per Hour">Hourly Rate</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PROPERTIES & RENT */}
            {category === "Properties & Rent" && (
              <div className="p-4 bg-cyan-950/40 border border-cyan-800/60 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <span>🏠</span> Property &amp; Rental Specifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Property Type
                    </label>
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-cyan-500 font-medium cursor-pointer"
                    >
                      <option value="Apartment / Flat for Rent">Apartment / Flat for Rent</option>
                      <option value="House / Villa for Rent">House / Villa for Rent</option>
                      <option value="Commercial Space / Shop">Commercial Space / Shop</option>
                      <option value="Plot / Land for Sale">Plot / Land for Sale</option>
                      <option value="House / Flat for Sale">House / Flat for Sale</option>
                      <option value="PG / Roommate">PG / Roommate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Bedrooms / Configuration
                    </label>
                    <select
                      value={bhk}
                      onChange={(e) => setBhk(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-cyan-500 font-medium cursor-pointer"
                    >
                      <option value="1 RK / Studio">1 RK / Studio</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK">4+ BHK</option>
                      <option value="Commercial / Land">Commercial / Land</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Furnishing Status
                    </label>
                    <select
                      value={furnishing}
                      onChange={(e) => setFurnishing(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-cyan-500 font-medium cursor-pointer"
                    >
                      <option value="Unfurnished">Unfurnished</option>
                      <option value="Semi-Furnished">Semi-Furnished</option>
                      <option value="Fully Furnished">Fully Furnished</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 3. VEHICLES & BIKES */}
            {category === "Vehicles & Bikes" && (
              <div className="p-4 bg-amber-950/40 border border-amber-800/60 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span>🚗</span> Vehicle Specifications
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option value="Car">Car</option>
                      <option value="Motorcycle / Bike">Motorcycle / Bike</option>
                      <option value="Scooter / Scooty">Scooter / Scooty</option>
                      <option value="Commercial Vehicle">Commercial Vehicle</option>
                      <option value="Auto / Rickshaw">Auto / Rickshaw</option>
                      <option value="Bicycle">Bicycle</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Fuel Type
                    </label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric (EV)">Electric (EV)</option>
                      <option value="CNG / Hybrid">CNG / Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Transmission
                    </label>
                    <select
                      value={transmission}
                      onChange={(e) => setTransmission(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Condition
                    </label>
                    <select
                      value={itemCondition}
                      onChange={(e) => setItemCondition(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-amber-500 font-medium cursor-pointer"
                    >
                      <option value="Brand New">Brand New</option>
                      <option value="Like New">Like New</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PETS & LIVESTOCK */}
            {category === "Pets & Livestock" && (
              <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <span>🐾</span> Pet &amp; Animal Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Animal / Pet Category
                    </label>
                    <select
                      value={petType}
                      onChange={(e) => setPetType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-purple-500 font-medium cursor-pointer"
                    >
                      <option value="Dogs & Puppies">Dogs &amp; Puppies</option>
                      <option value="Cats & Kittens">Cats &amp; Kittens</option>
                      <option value="Birds & Parrots">Birds &amp; Parrots</option>
                      <option value="Fishes & Aquarium">Fishes &amp; Aquarium</option>
                      <option value="Cows & Dairy Cattle">Cows &amp; Dairy Cattle</option>
                      <option value="Goats & Sheep">Goats &amp; Sheep</option>
                      <option value="Poultry, Ducks & Chicks">Poultry, Ducks &amp; Chicks</option>
                      <option value="Other Farm Animals">Other Farm Animals</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Breed / Age / Details
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Golden Retriever (3 months), Pure Assam Desi"
                      value={breedOrAge}
                      onChange={(e) => setBreedOrAge(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. TEA & AGRO PRODUCTS */}
            {category === "Tea & Agro Products" && (
              <div className="p-4 bg-lime-950/40 border border-lime-800/60 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-lime-400 flex items-center gap-1.5">
                  <span>🍵</span> Tea &amp; Agro Specifications
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Product Type
                    </label>
                    <select
                      value={agroType}
                      onChange={(e) => setAgroType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-lime-500 font-medium cursor-pointer"
                    >
                      <option value="Organic Assam CTC / Orthodox Tea">Organic Assam CTC / Orthodox Tea</option>
                      <option value="Specialty Green & White Tea">Specialty Green &amp; White Tea</option>
                      <option value="Bhut Jolokia & Northeast Spices">Bhut Jolokia &amp; Northeast Spices</option>
                      <option value="Organic Honey & Forest Goods">Organic Honey &amp; Forest Goods</option>
                      <option value="Assam Joha & Black Rice">Assam Joha &amp; Black Rice</option>
                      <option value="Bamboo & Timber Plants">Bamboo &amp; Timber Plants</option>
                      <option value="Seeds, Saplings & Nursery">Seeds, Saplings &amp; Nursery</option>
                      <option value="Farming Equipment & Tools">Farming Equipment &amp; Tools</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Unit / Package Size
                    </label>
                    <select
                      value={quantityUnit}
                      onChange={(e) => setQuantityUnit(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-lime-500 font-medium cursor-pointer"
                    >
                      <option value="Per 250g Pack">Per 250g Pack</option>
                      <option value="Per 500g Pack">Per 500g Pack</option>
                      <option value="Per 1 Kg Pack">Per 1 Kg Pack</option>
                      <option value="Bulk / Per Quintal">Bulk / Per Quintal</option>
                      <option value="Per Piece / Plant">Per Piece / Plant</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 6. HANDLOOMS & CRAFTS */}
            {category === "Handlooms & Crafts" && (
              <div className="p-4 bg-orange-950/40 border border-orange-800/60 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <span>🧣</span> Handloom, Silk &amp; Craft Details
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Silk / Material Variety
                    </label>
                    <select
                      value={fabricType}
                      onChange={(e) => setFabricType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-orange-500 font-medium cursor-pointer"
                    >
                      <option value="Pure Muga Silk">Pure Golden Muga Silk</option>
                      <option value="Eri / Ahimsa Silk">Eri / Ahimsa Organic Silk</option>
                      <option value="Pat Silk (Mulberry)">Pat Silk (Mulberry)</option>
                      <option value="Traditional Cotton Mekhela Sador">Traditional Cotton Mekhela Sador</option>
                      <option value="Gamusa & Tribal Shawls">Gamusa &amp; Tribal Shawls</option>
                      <option value="Cane & Bamboo Crafts">Cane &amp; Bamboo Crafts</option>
                      <option value="Brass & Bell Metal (Sarthebari)">Brass &amp; Bell Metal (Sarthebari)</option>
                      <option value="Woodcarving & Mask Art">Woodcarving &amp; Majuli Mask Art</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Craft Condition
                    </label>
                    <select
                      value={craftCondition}
                      onChange={(e) => setCraftCondition(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-orange-500 font-medium cursor-pointer"
                    >
                      <option value="Brand New (Handwoven)">Brand New (Handwoven)</option>
                      <option value="Master Artisan Handcrafted">Master Artisan Handcrafted</option>
                      <option value="Vintage / Heirloom">Vintage / Heirloom</option>
                      <option value="Like New">Like New</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 7. MOBILES, ELECTRONICS, FURNITURE, FASHION, BOOKS, OTHERS */}
            {!["Jobs & Services", "Properties & Rent", "Vehicles & Bikes", "Pets & Livestock", "Tea & Agro Products", "Handlooms & Crafts"].includes(category) && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Item Condition <span className="text-rose-400">*</span>
                </label>
                <select
                  value={itemCondition}
                  onChange={(e) => setItemCondition(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs md:text-sm outline-none focus:border-emerald-500 focus:bg-slate-900 font-medium cursor-pointer"
                >
                  <option value="Brand New (Sealed)">Brand New (Sealed / Unused)</option>
                  <option value="Like New">Like New (Mint Condition)</option>
                  <option value="Good">Good (Lightly Used)</option>
                  <option value="Fair">Fair (Working with Signs of Wear)</option>
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {category === "Jobs & Services" ? "Job Title / Service Name" : "Ad Title"} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={
                  category === "Jobs & Services"
                    ? "e.g. Hiring Accounts Executive in Guwahati or Expert Electrician Service"
                    : category === "Properties & Rent"
                    ? "e.g. Spacious 2 BHK Flat with Hill View in Zoo Road, Guwahati"
                    : "e.g. Royal Enfield Himalayan 2022 or Authentic Muga Silk Saree"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs md:text-sm outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
              />
            </div>

            {/* Price & Negotiable */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {category === "Jobs & Services"
                    ? "Salary / Compensation (₹ INR)"
                    : category === "Properties & Rent"
                    ? "Monthly Rent / Sale Amount (₹ INR)"
                    : "Price (₹ INR)"} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="e.g. 15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs md:text-sm outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 font-mono font-bold placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="pt-5">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-800 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-300">
                    {category === "Jobs & Services" ? "Salary is Negotiable" : "Price is Negotiable"}
                  </span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Detailed Description <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                required
                placeholder={
                  category === "Jobs & Services"
                    ? "Describe roles & responsibilities, required qualifications, working hours, interview process, and company details..."
                    : category === "Properties & Rent"
                    ? "Describe floor level, parking, water/power supply, nearby landmarks, deposit terms, and tenant preferences..."
                    : "Describe the item features, model, age, reasons for selling, accessories included..."
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs md:text-sm outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 resize-none leading-relaxed placeholder-slate-500"
              />
            </div>
          </div>

          {/* Section 2: Photos & File Upload */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>📷</span> Photos &amp; Images
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {uploadedImages.length} photo{uploadedImages.length === 1 ? "" : "s"} added
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFilesUpload(e.target.files);
              }}
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) handleFilesUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-emerald-500 bg-emerald-950/40 scale-[1.01]"
                  : "border-slate-700 hover:border-emerald-400 hover:bg-slate-800/80 bg-slate-800/40"
              }`}
            >
              {isUploading ? (
                <div className="py-4">
                  <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-emerald-400">Uploading photos...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-3xl">📤</div>
                  <div>
                    <span className="font-bold text-sm text-emerald-400 hover:underline">
                      Click to choose photos
                    </span>{" "}
                    <span className="text-xs text-slate-400">or drag &amp; drop here</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Supports JPG, PNG, WebP (up to 10MB per image, multiple photos supported)
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Thumbnails Grid */}
            {uploadedImages.length > 0 && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Uploaded Photos Preview:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {uploadedImages.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700 group bg-slate-950 shadow-xs"
                    >
                      <img
                        src={url}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 text-white text-[9px] font-bold rounded">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(idx);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center shadow-md transition cursor-pointer"
                        title="Remove photo"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toggle manual URL input */}
            <div className="pt-2">
              {!showUrlInput ? (
                <button
                  type="button"
                  onClick={() => setShowUrlInput(true)}
                  className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>🔗</span> Or paste an image URL directly
                </button>
              ) : (
                <div className="p-3.5 bg-slate-800 border border-slate-700 rounded-2xl space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-300">
                      Add Image via Direct URL
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(false)}
                      className="text-[11px] text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={manualUrl}
                      onChange={(e) => setManualUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 placeholder-slate-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Location Dropdowns */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>📍</span> Location in Northeast India
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* State Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  State <span className="text-rose-400">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => {
                    const nextState = e.target.value;
                    const nextCities = getCitiesForState(nextState);
                    const nextCity = nextCities[0] || "Main City";
                    const nextLocalities = getLocalitiesForCity(nextState, nextCity);
                    setState(nextState);
                    setCity(nextCity);
                    setLocality(nextLocalities[0] || "Main Area");
                  }}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 font-medium cursor-pointer"
                >
                  {NE_STATE_NAMES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  City / Town <span className="text-rose-400">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const nextCity = e.target.value;
                    const nextLocalities = getLocalitiesForCity(state, nextCity);
                    setCity(nextCity);
                    setLocality(nextLocalities[0] || "Main Area");
                  }}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 font-medium cursor-pointer"
                >
                  {getCitiesForState(state).map((cityName) => (
                    <option key={cityName} value={cityName}>
                      {cityName}
                    </option>
                  ))}
                  <option value="Other City">Other City / Town</option>
                </select>
                {city === "Other City" && (
                  <input
                    type="text"
                    required
                    placeholder="Enter city / town name"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                )}
              </div>

              {/* Locality / Neighborhood Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Neighborhood / Locality <span className="text-rose-400">*</span>
                </label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 font-medium cursor-pointer"
                >
                  {getLocalitiesForCity(state, city).map((locName) => (
                    <option key={locName} value={locName}>
                      {locName}
                    </option>
                  ))}
                </select>
                {locality === "Other Locality / Area" && (
                  <input
                    type="text"
                    placeholder="Enter specific area or landmark"
                    value={customLocality}
                    onChange={(e) => setCustomLocality(e.target.value)}
                    className="w-full mt-2 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500 placeholder-slate-500"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Contact */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <span>📞</span> Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number for Direct Calls
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 font-mono placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp Number (for instant chat)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={contactWhatsApp}
                  onChange={(e) => setContactWhatsApp(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs outline-none focus:border-emerald-500 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 font-mono placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/marketplace"
              className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-2xl transition border border-slate-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || isUploading}
              className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs md:text-sm rounded-2xl shadow-md transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Publishing Listing..." : "Post Listing Now (+30 XP)"}
            </button>
          </div>
        </form>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          if (!currentUser) router.push("/marketplace");
        }}
        onSuccess={() => fetchMe()}
      />
    </div>
  );
}
