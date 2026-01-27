'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PasteViewer() {
  const params = useParams();
  const pasteId = params.id;
  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchPaste = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        // Check if user already decremented views for this paste in this session
        const sessionKey = `paste_viewed_${pasteId}`;
        const alreadyViewed = typeof window !== 'undefined' && sessionStorage.getItem(sessionKey);

        // On first view, call the decrementing endpoint; on reload, call preview endpoint
        const endpoint = alreadyViewed 
          ? `/api/paste/preview/${pasteId}` 
          : `/api/paste/${pasteId}`;

        const response = await fetch(`${apiBase}${endpoint}`);

        if (!isMounted) return;

        if (!response.ok) {
          if (response.status === 404) {
            setError('Paste not found or has expired');
          } else {
            setError('Failed to load paste');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        if (isMounted) {
          setPaste(data);

          // Mark paste as viewed in this session to prevent decrementing on reload
          if (typeof window !== 'undefined' && !alreadyViewed) {
            sessionStorage.setItem(sessionKey, 'true');
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load paste');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPaste();

    return () => {
      isMounted = false;
    };
  }, [pasteId]);

  const handleCopy = async () => {
    if (paste?.content) {
      await navigator.clipboard.writeText(paste.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  if (error || !paste) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: 'center' }}>
          <h1 style={{ color: '#ff6b6b', marginBottom: '20px' }}>404</h1>
          <p style={{ fontSize: '1.1rem', marginBottom: '20px', color: '#666' }}>
            {error}
          </p>
          <p style={{ color: '#999', marginBottom: '20px' }}>
            The paste may have expired, reached its view limit, or never existed.
          </p>
          <Link href="/" style={styles.button}>
            ← Create a New Paste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Paste #{paste.id}</h1>
          <button onClick={handleCopy} style={styles.copyButton}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        <div style={styles.metadata}>
          {paste.remaining_views !== null && (
            <span style={styles.metaItem}>
              📊 Remaining Views: <strong>{paste.remaining_views}</strong>
            </span>
          )}
          {paste.expires_at && (
            <span style={styles.metaItem}>
              ⏰ Expires:{' '}
              <strong>{new Date(paste.expires_at).toLocaleString()}</strong>
            </span>
          )}
        </div>

        <pre style={styles.content}>{paste.content}</pre>

        <div style={styles.actions}>
          <Link href="/" style={{ ...styles.button, textDecoration: 'none' }}>
            ← Create New Paste
          </Link>
        </div>
      </div>

      <div style={styles.footer}>
        <p>
          <strong>⚠️ Warning:</strong> This paste will be deleted once it expires
          or reaches its view limit. Never paste sensitive information!
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    color: '#333',
  },
  copyButton: {
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
  metadata: {
    display: 'flex',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: '0.95rem',
    color: '#666',
  },
  content: {
    background: '#f5f5f5',
    padding: '20px',
    borderRadius: '6px',
    overflow: 'auto',
    maxHeight: '500px',
    fontSize: '14px',
    lineHeight: '1.6',
    border: '1px solid #ddd',
    fontFamily: 'Fira Code, monospace',
    color: '#333',
  },
  actions: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
  },
  button: {
    display: 'inline-block',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
  },
  footer: {
    background: '#fff3cd',
    padding: '15px',
    borderRadius: '6px',
    color: '#856404',
    fontSize: '0.9rem',
    borderLeft: '4px solid #ffc107',
  },
};
