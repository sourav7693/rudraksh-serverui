"use client";

import React, { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const WordLikeDescriptionBox: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = "Write Blog Descriptions...",
}) => {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (!editorContainerRef.current) return;
    if (quillRef.current) return;

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

    const quill = new Quill(editorContainerRef.current, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
      },
      placeholder,
    });

    quillRef.current = quill;

    // Set initial value if exists
    if (value) {
      quill.root.innerHTML = value;
    }

    const handleChange = () => {
      const html = quill.root.innerHTML;
      onChange(html);
    };

    quill.on("text-change", handleChange);

    return () => {
      quill.off("text-change", handleChange as any);
    };
  }, []); // run only once on mount

  // Keep external value in sync (for edit pages)
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const currentHtml = quill.root.innerHTML;
    if (value !== currentHtml) {
      quill.root.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div className="quill-wrapper rounded-md">
      <div ref={editorContainerRef} />
    </div>
  );
};

export default WordLikeDescriptionBox;