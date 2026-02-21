
import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const WordLikeDescriptionBox: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "Write Blog Description...",
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  // Initialize editor once
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ];

    const quill = new Quill(editorRef.current, {
      theme: "snow",
      placeholder,
      modules: { toolbar: toolbarOptions },
    });

    quillRef.current = quill;

    // Set initial value correctly
    quill.clipboard.dangerouslyPasteHTML(value || "");

    // Listen for changes
    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChange(html);
    });
  }, []);

  // Update editor only when external value changes (Edit mode)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const current = quill.root.innerHTML;

    // Prevent infinite loops
    if (value !== current) {
      quill.clipboard.dangerouslyPasteHTML(value || "");
    }
  }, [value]);

  return <div ref={editorRef} className="border rounded-md" />;
};

export default WordLikeDescriptionBox;
