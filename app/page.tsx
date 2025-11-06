"use client";
import { useState } from 'react';

export default function Page() {
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('url', url);
      if (!file) throw new Error('Please upload a DOCX resume');
      formData.append('resume', file);

      const res = await fetch('/api/process', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Failed to process');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  function downloadBase64(base64: string, filename: string, mime: string) {
    const a = document.createElement('a');
    a.href = `data:${mime};base64,${base64}`;
    a.download = filename;
    a.click();
  }

  return (
    <main>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          <div style={{ fontWeight: 600 }}>Job application link</div>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." required style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 8 }} />
        </label>
        <label>
          <div style={{ fontWeight: 600 }}>Upload your resume (.docx)</div>
          <input type="file" accept=".docx" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
        </label>
        <button disabled={loading} style={{ padding: '10px 16px', borderRadius: 8, background: '#111', color: '#fff', border: 0 }}>
          {loading ? 'Processing?' : 'Tailor Resume'}
        </button>
      </form>

      {error && <p style={{ color: 'crimson', marginTop: 16 }}>{error}</p>}

      {result && (
        <section style={{ marginTop: 24 }}>
          <h2>Tailoring Summary</h2>
          <p>{result.summary}</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button onClick={() => downloadBase64(result.docxBase64, result.docxFilename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}>Download DOCX</button>
            <button onClick={() => downloadBase64(result.pdfBase64, result.pdfFilename, 'application/pdf')}>Download PDF</button>
          </div>
          <details style={{ marginTop: 16 }}>
            <summary>Extracted Job Description</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{result.jobDescription}</pre>
          </details>
        </section>
      )}
    </main>
  );
}
