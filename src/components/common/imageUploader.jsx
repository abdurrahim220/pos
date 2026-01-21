import { Icon } from "@iconify/react";
import React, { useRef, useState } from "react";

export default function ImageUploader({ onUploadSuccess, index }) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null); // Unique ref for each uploader

  const handleFileChange = async (event) => {
    event.stopPropagation();
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/frontend/upload/image`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.image) {
          onUploadSuccess(data.image);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    setLoading(false);
  };

  return (
    <label
      htmlFor={`imageUpload-${index}`} // Unique ID for each uploader
      className="flex p-5 w-full h-full flex-col items-center border-dashed bg-neutral-50  rounded-md justify-center cursor-pointer"
      onClick={(e) => e.stopPropagation()} // Prevents unintended event bubbling
    >
      <Icon
        icon="solar:camera-outline"
        className="text-xl text-secondary-light"
      />
      <p className="mb-0">720X1005</p>
      <div className="rounded-md px-4 py-2 font-semibold">
        {loading ? "Uploading..." : "Upload"}
      </div>
      <input
        id={`imageUpload-${index}`} // Unique ID ensures correct input field
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </label>
  );
}
