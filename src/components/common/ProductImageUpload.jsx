import React from "react";

const ProductImageUpload = ({setImages}) => {
 
   

    const handleFileChange = (e) => {
        setImages([...e.target.files]); // Store multiple files in state
    };

   

    return (
            <input type="file" multiple onChange={handleFileChange} />
    );
};

export default ProductImageUpload;
