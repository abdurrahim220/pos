import React from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function DescriptionEditor({ value, onChange }) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      style={{ height: 250, paddingBottom: "30px" }}
      className="bg-white "
      modules={{
        clipboard: { matchVisual: false },
      }}
    />
  );
}
