import { useState } from 'react';
import { useRouter } from 'next/router';

export default function EngineerReviewForm() {
  const router = useRouter();
  const { claim_number } = router.query;
  
  const [form, setForm] = useState({
    engineer_review_of_damages: '',
    engineer_suggested_work: '',
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const MAX_FILES = 5;
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

    if (!claim_number) {
      setError('Claim number is required.');
      setSubmitting(false);
      return;
    }

    try {
      const images = await Promise.all(files.map(fileToBase64));

      const res = await fetch(`/api/submit-claim/${claim_number}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, images }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Something went wrong submitting the claim.');
      }

      setSuccess(json.message || 'Claim blocks updated and attachments uploaded successfully.');
      setForm({ engineer_review_of_damages: '', engineer_suggested_work: '' });
      setFiles([]);
    } catch (err) {
      setError(err.message || 'Unexpected error.');
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while router is getting the claim_number
  if (!claim_number) {
    return (
      <main
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f4f4f5',
        }}
      >
        <div>Loading...</div>
      </main>
    );
  }

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
          Engineer Review - Claim {claim_number}
        </h1>
        <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
          Review damages and suggest work for this claim.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 500 }}>Engineer Review of Damages</span>
            <textarea
              name="engineer_review_of_damages"
              value={form.engineer_review_of_damages}
              onChange={handleChange}
              rows={6}
              required
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Enter your review of the damages..."
            />
          </label>

          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 500 }}>Engineer Suggested Work</span>
            <textarea
              name="engineer_suggested_work"
              value={form.engineer_suggested_work}
              onChange={handleChange}
              rows={6}
              required
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Enter your suggested work..."
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
            {submitting ? 'Submitting…' : 'Submit Review'}
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

