import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react"; // Assuming you're using iconify for icons
import ImageUploader from "../common/imageUploader";

const MultiImageUpload = ({ formData, setFormData, defaultOff }) => {
  const [previews, setPreviews] = useState([]);

  // Handle multiple file selection
  const handleFileChange = (links) => {
    setPreviews((prev) => [...prev, links]);
  };

  // Remove image by index
  const handleRemoveImage = (index) => {
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setPreviews(updatedPreviews);
  };
  useEffect(() => {
    setFormData({ images: previews });
  }, [previews]);
  useEffect(() => {
    if (previews?.length === 0 && formData?.images?.length > 0) {
      setPreviews(formData.images);
    }
  }, [formData.images]);
  return (
    <div className="col-span-8">
      <div className="upload-image-wrapper flex items-center gap-3">
        {previews?.map((preview, index) => (
          <div
            key={index}
            className="uploaded-img relative w-[131px] h-[210px]  border input-form-light rounded-lg overflow-hidden border-dashed bg-neutral-50 "
          >
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="uploaded-img__remove absolute top-1 right-1 z-1 text-2xxl    flex"
            >
              <Icon
                icon="radix-icons:cross-2"
                className="text-xl text-danger-600"
              />
            </button>

            <img
              style={{ objectFit: "contain" }}
              className="h-[181px] w-[130px] "
              src={preview?.small?.url || preview?.small}
              alt={`image-${index}`}
            />
            <></>
            {!defaultOff && (
              <div className="w-[20px] h-[30px] p-2  text-2xxl  flex items-center cursor-pointer  gap-2">
                <input
                  type="radio"
                  checked={
                    formData.default_image?.small?.url ===
                      preview?.small?.url ||
                    formData.default_image?.small === preview?.small
                  }
                  onClick={() => setFormData({ default_image: preview })}
                />
                <label>Default</label>
              </div>
            )}
          </div>
        ))}

        <label className="upload-file  h-[210px] w-[131px] border input-form-light rounded-lg overflow-hidden   ">
          <ImageUploader
            onUploadSuccess={(links) => {
              handleFileChange(links);
            }}
          />
        </label>
      </div>
    </div>
  );
};

export default MultiImageUpload;
