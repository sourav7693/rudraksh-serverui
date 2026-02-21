import { useQuill } from "react-quilljs";

import "quill/dist/quill.snow.css";
import { useEffect, useState } from "react";

const QuillEditor = () => {
    const [shortDescription, setShortDescription] = useState("");
     const { quill, quillRef } = useQuill();
      useEffect(() => {
         if (quill) {
           quill.on("text-change", () => {
             setShortDescription(quill.root.innerHTML);
           });
         }
       }, [quill]);
  return <div>QuillEditor</div>;
};

export default QuillEditor;
