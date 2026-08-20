"use client";

import React, { useState } from "react";
import BusinessEnquiryModal from "./BusinessEnquiryModal";

interface BusinessEnquiryButtonProps {
  directoryId: number;
  businessName: string;
  businessPhone?: string | null;
  businessEmail?: string | null;
  className?: string;
  label?: string;
}

export default function BusinessEnquiryButton({
  directoryId,
  businessName,
  businessPhone,
  businessEmail,
  className,
  label = "Contact Business / Send Inquiry",
}: BusinessEnquiryButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className={
          className ||
          "w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 px-6 rounded-2xl transition duration-200 flex items-center justify-center font-bold text-sm shadow-md hover:shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transform active:scale-98 cursor-pointer gap-2"
        }
      >
        <span>📬</span>
        <span>{label}</span>
      </button>

      <BusinessEnquiryModal
        directoryId={directoryId}
        businessName={businessName}
        businessPhone={businessPhone}
        businessEmail={businessEmail}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
