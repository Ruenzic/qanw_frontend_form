import { useState } from 'react';

export default function ClaimDemoPage() {
  const [form, setForm] = useState({
    claimId: '',
    description: '',
    email: '',
    reference: '',
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const MAX_FILES = 4;
  const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setError('');
    const selected = Array.from(e.target.files || []);

    if (selected.length > MAX_FILES) {
      setError(`You can upload a maximum of ${MAX_FILES} images.`);
    }

    const limited = selected.slice(0, MAX_FILES);

    const oversized = limited.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setError(
        `File "${oversized.name}" is larger than 4MB. Please choose smaller images.`
      );
      setFiles([]);
      return;
    }

    setFiles(limited);
  };

  // Convert file to base64 - files stored locally in browser memory only
  // No server-side file storage - base64 is sent directly to API route
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // result is "data:<mime>;base64,XXXX"
        const base64 = typeof result === 'string' ? result.split(',')[1] : '';
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess('');
    setError('');

    try {
      const images = await Promise.all(files.map(fileToBase64));

      const res = await fetch('/api/submit-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, images }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong submitting the claim.');
      }

      setSuccess(json.message || 'Claim updated and attachments uploaded (demo).');
      setForm({ claimId: '', description: '', email: '', reference: '' });
      setFiles([]);
    } catch (err) {
      setError(err.message || 'Unexpected error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f4f5',
        padding: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: 600,
          width: '100%',
          background: '#ffffff',
          borderRadius: 16,
          padding: '1.5rem 1.75rem',
          boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          Demo Claim Upload
        </h1>
        <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
          Simple demo form that updates a claim and uploads up to four images via
          Root&apos;s API.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 500 }}>Claim ID</span>
            <input
              type="text"
              name="claimId"
              value={form.claimId}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 500 }}>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 500 }}>Contact email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 500 }}>Internal reference (optional)</span>
            <input
              type="text"
              name="reference"
              value={form.reference}
              onChange={handleChange}
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 500 }}>
              Images (max {MAX_FILES}, up to 4MB each)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ marginTop: '0.35rem' }}
            />
            {files.length > 0 && (
              <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                {files.map((f) => (
                  <li key={f.name}>
                    {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            )}
          </label>

          {error && (
            <p style={{ color: '#b91c1c', fontSize: '0.9rem', marginTop: '0.75rem' }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ color: '#15803d', fontSize: '0.9rem', marginTop: '0.75rem' }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '1.25rem',
              width: '100%',
              padding: '0.7rem 1rem',
              borderRadius: 9999,
              border: 'none',
              background: submitting ? '#9ca3af' : '#111827',
              color: '#ffffff',
              fontWeight: 600,
              cursor: submitting ? 'default' : 'pointer',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit claim'}
          </button>
        </form>
      </div>
    </main>
  );
}

const inputStyle = {
  marginTop: '0.35rem',
  width: '100%',
  padding: '0.6rem 0.75rem',
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  fontSize: '0.95rem',
  outline: 'none',
  boxSizing: 'border-box',
};

