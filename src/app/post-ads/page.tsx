"use client";

import { useState } from "react";

export default function PostAdsPage() {
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("Hospitality");
  const [district, setDistrict] = useState("Kamrup");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !contactNumber) return;
    setSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName,
          email: email || `${businessName.toLowerCase().replace(/\s+/g, "")}@listing.com`,
          role: "Business",
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setStatusMsg("✅ Business listing submitted successfully for verification!");
        setBusinessName("");
        setContactNumber("");
        setEmail("");
        setDescription("");
      } else {
        setStatusMsg("❌ Failed to submit business listing.");
      }
    } catch (err) {
      setStatusMsg("❌ Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full bg-gray-50 min-h-screen py-12 px-4 font-sans">
      <div className="container mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-3 pt-8">
          <span className="text-emerald-700 font-semibold text-xs uppercase tracking-wider">Business Directory</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Post Business Listing &amp; Ads</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Reach tourists, visitors, and local residents across North East India by listing your business in our directory.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kaziranga Eco Resort"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Hospitality">Hospitality (Hotel / Resort)</option>
                  <option value="Travel">Travel &amp; Tour Operator</option>
                  <option value="Healthcare">Healthcare &amp; Wellness</option>
                  <option value="Education">Education &amp; Training</option>
                  <option value="Retail">Retail &amp; Shopping</option>
                  <option value="Food">Food &amp; Restaurants</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">District</label>
                <input
                  type="text"
                  placeholder="e.g. Golaghat, Kamrup, Jorhat"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Contact Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 9876543210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@business.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Business Description</label>
              <textarea
                rows={4}
                placeholder="Describe your services, accommodations, or offerings..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {statusMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800">
                {statusMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Submitting Listing..." : "Submit Business Listing"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
