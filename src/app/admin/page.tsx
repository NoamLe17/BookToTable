'use client';

import React, { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, onSnapshot, query, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { deleteUserAction } from '@/app/actions/admin';
import { Users, BookOpen, ShoppingBag, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { firebaseUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to real-time collections
    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snap) => {
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubBooks = onSnapshot(query(collection(db, 'books')), (snap) => {
      setBooks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubOrders = onSnapshot(query(collection(db, 'orders')), (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);
    return () => {
      unsubUsers();
      unsubBooks();
      unsubOrders();
    };
  }, []);

  const handleDeleteBook = async (bookId: string, coverUrl: string) => {
    if (!confirm('Are you sure you want to permanently delete this book?')) return;
    
    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'books', bookId));
      
      // 2. Try to delete cover from Storage (if not an external URL)
      if (coverUrl && coverUrl.includes('firebasestorage')) {
        try {
          const coverRef = ref(storage, coverUrl);
          await deleteObject(coverRef);
        } catch (storageErr) {
          console.warn('Could not delete storage object:', storageErr);
        }
      }
      toast.success('Book deleted successfully');
    } catch (err: any) {
      toast.error('Error deleting book: ' + err.message);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('CRITICAL: Are you sure you want to completely destroy this user account?')) return;
    if (!firebaseUser?.email) return;

    try {
      const toastId = toast.loading('Deleting user account...');
      const res = await deleteUserAction(uid, firebaseUser.email);
      if (res.success) {
        toast.success('User permanently deleted', { id: toastId });
      } else {
        toast.error('Error: ' + res.error, { id: toastId });
      }
    } catch (err: any) {
      toast.error('Action failed: ' + err.message);
    }
  };

  const impersonateUser = (uid: string) => {
    router.push(`/dashboard?impersonate=${uid}`);
  };

  if (loading) return <div>טוען נתונים...</div>;

  return (
    <div className="space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold">Total Users</p>
            <p className="text-3xl font-black">{users.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <BookOpen size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold">Total Books</p>
            <p className="text-3xl font-black">{books.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
            <ShoppingBag size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-bold">Total Orders</p>
            <p className="text-3xl font-black">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold">Users Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" dir="ltr">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="p-4 font-bold">UID / Name</th>
                <th className="p-4 font-bold">Email</th>
                <th className="p-4 font-bold">Books</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-sm">{u.name || 'No Name'}</div>
                    <div className="text-xs text-gray-400 font-mono">{u.id}</div>
                  </td>
                  <td className="p-4 text-sm">{u.email}</td>
                  <td className="p-4 text-sm font-bold text-gray-600">
                    {books.filter(b => b.authorId === u.id).length}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => impersonateUser(u.id)}
                        className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Eye size={14} /> View Dashboard
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOOKS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold">Content Moderation (Books)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left" dir="ltr">
            <thead className="bg-gray-50 text-sm text-gray-500">
              <tr>
                <th className="p-4 font-bold">Title</th>
                <th className="p-4 font-bold">Author UID</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {books.map(b => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-sm max-w-[200px] truncate">{b.title}</td>
                  <td className="p-4 text-xs font-mono text-gray-400">{b.authorId}</td>
                  <td className="p-4 text-sm">₪{b.price}</td>
                  <td className="p-4">
                    <button 
                      onClick={() => handleDeleteBook(b.id, b.coverUrl)}
                      className="flex items-center gap-1 text-red-500 hover:bg-red-50 px-2 py-1 rounded transition-colors text-xs font-bold"
                    >
                      <Trash2 size={14} /> Delete Book
                    </button>
                  </td>
                </tr>
              ))}
              {books.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No books found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
