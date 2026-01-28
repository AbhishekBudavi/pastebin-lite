'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [viewLimit, setViewLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [successUrl, setSuccessUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (successUrl) {
      await navigator.clipboard.writeText(successUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const body: any = { content };
      if (ttl) body.ttl = parseInt(ttl);
      if (viewLimit) body.view_limit = parseInt(viewLimit);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/paste`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create paste');
      }

      const data = await response.json();
      setSuccess(`✅ Paste created successfully!`);
      setSuccessUrl(data.url);
      setContent('');
      setTtl('');
      setViewLimit('');

      // Don't auto-redirect - let user manually view or copy link
      // Remove the setTimeout that redirects
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create paste');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pastebin Lite</h1>
      <p style={styles.subtitle}>Share temporary code snippets securely</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Content <span style={{ color: '#ff6b6b' }}>*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your code or text here..."
            style={styles.textarea}
            required
          />
        </div>

        <div style={styles.optionsRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Time to Live (seconds)</label>
            <input
              type="number"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              placeholder="e.g., 3600 (1 hour)"
              style={styles.input}
              min="1"
            />
            <small style={styles.hint}>
              Leave blank for permanent storage
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>View Limit</label>
            <input
              type="number"
              value={viewLimit}
              onChange={(e) => setViewLimit(e.target.value)}
              placeholder="e.g., 5"
              style={styles.input}
              min="1"
            />
            <small style={styles.hint}>
              Leave blank for unlimited views
            </small>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {success && (
          <div style={styles.success}>
            <div style={{ marginBottom: '10px' }}>{success}</div>
            <div style={styles.successContent}>
              <input
                type="text"
                readOnly
                value={successUrl}
                style={styles.urlInput}
              />
              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  ...styles.copyButton,
                  background: copied ? '#2ecc71' : '#667eea',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <p style={styles.successHint}>
              📤 Share this link with others. Redirecting in 5 seconds...
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !content.trim()}
          style={{
            ...styles.button,
            opacity: loading || !content.trim() ? 0.7 : 1,
            cursor: loading || !content.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating...' : 'Create Paste'}
        </button>
      </form>

      <div style={styles.footer}>
        <p>
          <strong>Privacy Note:</strong> Your content is stored on our server
          and can be deleted by anyone with the link. Never paste sensitive
          information.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    color: '#333',
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    textAlign: 'center' as const,
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    flex: 1,
  },
  label: {
    fontWeight: 600,
    color: '#333',
    fontSize: '0.95rem',
  },
  textarea: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical' as const,
    minHeight: '300px',
    fontFamily: 'Fira Code, monospace',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
  },
  optionsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  hint: {
    fontSize: '0.8rem',
    color: '#999',
    marginTop: '4px',
  },
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    padding: '12px',
    background: '#fee',
    color: '#c33',
    borderRadius: '6px',
    fontSize: '0.95rem',
  },
  success: {
    padding: '15px',
    background: '#efe',
    color: '#3c3',
    borderRadius: '6px',
    fontSize: '0.95rem',
    border: '2px solid #2ecc71',
  },
  successContent: {
    display: 'flex',
    gap: '10px',
    margin: '10px 0',
  },
  urlInput: {
    flex: 1,
    padding: '10px',
    border: '1px solid #2ecc71',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    backgroundColor: '#f9f9f9',
  },
  copyButton: {
    padding: '8px 16px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    whiteSpace: 'nowrap' as const,
  },
  successHint: {
    fontSize: '0.85rem',
    color: '#2ecc71',
    marginTop: '8px',
  },
  footer: {
    marginTop: '30px',
    padding: '20px',
    background: '#f9f9f9',
    borderRadius: '6px',
    fontSize: '0.9rem',
    color: '#666',
    borderLeft: '4px solid #667eea',
  },
};
