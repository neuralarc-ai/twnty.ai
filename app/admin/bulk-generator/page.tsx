"use client";
import { useState } from "react";

export default function BulkGenerator() {
  const [topicsFile, setTopicsFile] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!topicsFile || images.length === 0) {
      setStatus("Please select a topics file and at least one image.");
      return;
    }
    setLoading(true);
    setStatus("Uploading and generating...");
    const fd = new FormData();
    fd.append("topicsFile", topicsFile);
    images.forEach((img) => fd.append("images", img));
    try {
      const res = await fetch("/api/admin/bulk-generator", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus(`Scheduled ${data.articlesScheduled} articles using ${data.imagesUploaded} images.`);
    } catch (e: any) {
      setStatus(e.message || "Error while processing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Bulk Article Generator</h1>
      <input type="file" onChange={e => e.target.files && setTopicsFile(e.target.files[0])} />
      <input type="file" multiple onChange={e => e.target.files && setImages(Array.from(e.target.files))} />
      <button type="button" onClick={handleSubmit} disabled={loading}>{loading ? "Processing..." : "Submit"}</button>
      {status && <p>{status}</p>}
    </div>
  );
}

