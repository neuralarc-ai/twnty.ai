'use client';

import dynamic from 'next/dynamic';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'color', 'background',
    'blockquote', 'code-block',
    'link'
  ];

  return (
    <div className="rich-text-editor-wrapper">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Start writing your article...'}
        style={{ 
          minHeight: '400px',
          backgroundColor: 'white'
        }}
      />
      <style jsx global>{`
        .rich-text-editor-wrapper .ql-container {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.1rem;
          line-height: 1.8;
          min-height: 400px;
        }
        
        .rich-text-editor-wrapper .ql-editor {
          min-height: 400px;
        }
        
        .rich-text-editor-wrapper .ql-editor.ql-blank::before {
          font-style: normal;
          color: #999;
        }
        
        .rich-text-editor-wrapper .ql-toolbar {
          border: 1px solid #ddd;
          border-bottom: none;
          background: #fafafa;
          border-radius: 4px 4px 0 0;
        }
        
        .rich-text-editor-wrapper .ql-container {
          border: 1px solid #ddd;
          border-radius: 0 0 4px 4px;
          font-size: 16px;
        }
        
        .rich-text-editor-wrapper .ql-editor strong {
          font-weight: 700;
        }
        
        .rich-text-editor-wrapper .ql-editor em {
          font-style: italic;
        }
        
        .rich-text-editor-wrapper .ql-editor p {
          margin-bottom: 1.2em;
        }
        
        .rich-text-editor-wrapper .ql-editor h1,
        .rich-text-editor-wrapper .ql-editor h2,
        .rich-text-editor-wrapper .ql-editor h3 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 700;
        }
        
        .rich-text-editor-wrapper .ql-editor h1 {
          font-size: 2em;
        }
        
        .rich-text-editor-wrapper .ql-editor h2 {
          font-size: 1.5em;
        }
        
        .rich-text-editor-wrapper .ql-editor h3 {
          font-size: 1.25em;
        }
      `}</style>
    </div>
  );
}

