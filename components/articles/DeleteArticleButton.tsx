'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DeleteArticleButtonProps {
  articleId: string;
}

export default function DeleteArticleButton({ articleId }: DeleteArticleButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Hapus artikel ini?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert('Gagal menghapus artikel');
      }
    } catch {
      alert('Terjadi kesalahan koneksi');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="btn btn-danger btn-sm"
    >
      {deleting ? '...' : 'Hapus'}
    </button>
  );
}
