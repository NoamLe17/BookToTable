'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import {
  ShoppingBag, ChevronDown, ChevronUp, Trash2, Package,
  Truck, CheckCircle, Clock, XCircle, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusLabel = (s: string) => ({ pending:'ממתין', shipped:'נשלח', delivered:'הגיע', pending_payment:'ממתין לתשלום', cancelled:'בוטל' }[s] ?? s);
const statusColor = (s: string) => ({
  pending:'bg-yellow-100 text-yellow-700 border-yellow-200',
  shipped:'bg-blue-100 text-blue-700 border-blue-200',
  delivered:'bg-green-100 text-green-700 border-green-200',
  pending_payment:'bg-orange-100 text-orange-700 border-orange-200',
  cancelled:'bg-red-100 text-red-700 border-red-200'
}[s] ?? 'bg-gray-100 text-gray-600 border-gray-200');

const statusIcon = (s: string) => {
  const props = { size: 13 };
  if (s === 'delivered') return <CheckCircle {...props} />;
  if (s === 'shipped')   return <Truck {...props} />;
  if (s === 'cancelled') return <XCircle {...props} />;
  return <Clock {...props} />;
};

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit', year:'2-digit' });
}

function getTs(item: any): number {
  if (typeof item.createdAt === 'number') return item.createdAt;
  if (item.createdAt?.toMillis) return item.createdAt.toMillis();
  return 0;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let n = 0;
    const done = () => { if (++n >= 2) setLoading(false); };
    const u1 = onSnapshot(query(collection(db,'orders'), orderBy('createdAt','desc')), s => {
      setOrders(s.docs.map(d => ({ id: d.id, ...d.data() })));
      done();
    });
    const u2 = onSnapshot(query(collection(db,'users'), orderBy('createdAt','desc')), s => {
      setUsers(s.docs.map(d => ({ id: d.id, ...d.data() })));
      done();
    });
    return () => { u1(); u2(); };
  }, []);

  // Group orders by author
  const byAuthor = useMemo(() => {
    const map: Record<string, { authorId: string; authorName: string; authorEmail: string; orders: any[] }> = {};
    orders.forEach(o => {
      const aid = o.authorId || 'unknown';
      if (!map[aid]) {
        const u = users.find(u => u.id === aid);
        map[aid] = {
          authorId: aid,
          authorName: o.authorName || u?.name || 'ללא שם',
          authorEmail: u?.email || '',
          orders: [],
        };
      }
      map[aid].orders.push(o);
    });
    // Sort by revenue desc
    return Object.values(map).sort((a, b) => {
      const ra = a.orders.reduce((s, o) => s + (o.totalPaid || 0), 0);
      const rb = b.orders.reduce((s, o) => s + (o.totalPaid || 0), 0);
      return rb - ra;
    });
  }, [orders, users]);

  const totalRevenue = useMemo(() => orders.reduce((s,o) => s+(o.totalPaid||0), 0), [orders]);
  const statusCounts = useMemo(() => {
    const c: Record<string,number> = {};
    orders.forEach(o => { c[o.status] = (c[o.status]||0)+1; });
    return c;
  }, [orders]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleDeleteSelected = async () => {
    if (selected.size === 0) return;
    if (!confirm(`למחוק ${selected.size} הזמנות? פעולה זו בלתי הפיכה!`)) return;
    setDeleting(true);
    try {
      const batch = writeBatch(db);
      selected.forEach(id => batch.delete(doc(db, 'orders', id)));
      await batch.commit();
      setSelected(new Set());
      toast.success(`נמחקו ${selected.size} הזמנות`);
    } catch (e: any) {
      toast.error('שגיאה: ' + e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('למחוק הזמנה זו?')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
      toast.success('הזמנה נמחקה');
    } catch (e: any) {
      toast.error('שגיאה: ' + e.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3"/>
        <p className="text-gray-500 font-medium">טוען הזמנות...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingBag size={26} className="text-red-600"/>ניהול הזמנות
          </h1>
          <p className="text-gray-500 mt-1 text-sm">מכירות לפי סופר עם נתוני משלוח ומכירות</p>
        </div>
        {selected.size > 0 && (
          <button onClick={handleDeleteSelected} disabled={deleting}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 shadow-sm">
            <Trash2 size={16}/>
            {deleting ? 'מוחק...' : `מחק ${selected.size} הזמנות נבחרות`}
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'סה״כ הזמנות', val:orders.length, color:'bg-purple-50 text-purple-800', icon:ShoppingBag },
          { label:'ממתינות',     val:(statusCounts['pending']||0)+(statusCounts['pending_payment']||0), color:'bg-yellow-50 text-yellow-800', icon:Clock },
          { label:'נשלחו',       val:statusCounts['shipped']||0, color:'bg-blue-50 text-blue-800', icon:Truck },
          { label:'הגיעו',       val:statusCounts['delivered']||0, color:'bg-green-50 text-green-800', icon:CheckCircle },
        ].map(c => (
          <div key={c.label} className={`rounded-2xl p-4 sm:p-5 ${c.color} border border-transparent`}>
            <div className="flex items-center gap-2 mb-1"><c.icon size={15}/><p className="text-xs font-bold">{c.label}</p></div>
            <p className="text-2xl sm:text-3xl font-black">{c.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <p className="text-sm text-gray-500">סך הכנסות: <span className="text-xl font-black text-gray-900">₪{totalRevenue.toLocaleString()}</span></p>
      </div>

      {/* Delete test orders hint */}
      {selected.size === 0 && orders.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800 flex items-center gap-2">
          <Trash2 size={15} className="shrink-0"/>
          <span>לבחירת הזמנות בדיקה למחיקה — לחץ על תיבת הסימון ליד כל הזמנה בפירוט הסופר</span>
        </div>
      )}

      {/* Per-Author Tables */}
      <div className="space-y-4">
        {byAuthor.map(author => {
          const revenue = author.orders.reduce((s, o) => s+(o.totalPaid||0), 0);
          const sold = author.orders.reduce((s, o) => s+(o.quantity||1), 0);
          const pending = author.orders.filter(o => o.status==='pending'||o.status==='pending_payment').length;
          const shipped = author.orders.filter(o => o.status==='shipped').length;
          const delivered = author.orders.filter(o => o.status==='delivered').length;
          const isOpen = expanded === author.authorId;

          return (
            <div key={author.authorId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Author header row */}
              <div
                className="p-4 sm:p-5 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : author.authorId)}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-400 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0">
                  {(author.authorName||'?')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 truncate">{author.authorName}</p>
                  <p className="text-xs text-gray-400 truncate">{author.authorEmail}</p>
                </div>

                {/* Stats pills */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">{author.orders.length} הזמנות</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">{sold} ספרים</span>
                  <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full">₪{revenue.toLocaleString()}</span>
                  {pending > 0 && <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-full">{pending} ממתינות</span>}
                  {shipped > 0 && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{shipped} נשלחו</span>}
                  {delivered > 0 && <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">{delivered} הגיעו</span>}
                </div>

                {/* Mobile stats */}
                <div className="flex sm:hidden flex-col items-end gap-1 shrink-0 text-xs">
                  <span className="font-black text-gray-900">₪{revenue.toLocaleString()}</span>
                  <span className="text-gray-400">{author.orders.length} הזמנות</span>
                </div>

                {isOpen ? <ChevronUp size={18} className="text-gray-400 shrink-0"/> : <ChevronDown size={18} className="text-gray-400 shrink-0"/>}
              </div>

              {/* Orders list */}
              {isOpen && (
                <div className="border-t border-gray-100">
                  {/* Desktop table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full" dir="rtl">
                      <thead className="bg-gray-50 text-xs text-gray-500">
                        <tr>
                          <th className="p-3 text-right w-8">
                            <input type="checkbox"
                              checked={author.orders.every(o => selected.has(o.id))}
                              onChange={e => {
                                setSelected(prev => {
                                  const n = new Set(prev);
                                  author.orders.forEach(o => e.target.checked ? n.add(o.id) : n.delete(o.id));
                                  return n;
                                });
                              }}
                              className="rounded"
                            />
                          </th>
                          <th className="p-3 font-bold text-right">ספר</th>
                          <th className="p-3 font-bold text-right">קורא</th>
                          <th className="p-3 font-bold text-right">כתובת</th>
                          <th className="p-3 font-bold text-right">כמות</th>
                          <th className="p-3 font-bold text-right">סכום</th>
                          <th className="p-3 font-bold text-right">תאריך</th>
                          <th className="p-3 font-bold text-right">סטטוס</th>
                          <th className="p-3 font-bold text-right">פעולות</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {author.orders.map(o => (
                          <tr key={o.id} className={`hover:bg-gray-50 transition-colors ${selected.has(o.id) ? 'bg-red-50' : ''}`}>
                            <td className="p-3">
                              <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)} className="rounded"/>
                            </td>
                            <td className="p-3 font-bold text-sm max-w-[150px]">
                              <p className="truncate">{o.bookTitle || o.bookId || 'ספר'}</p>
                            </td>
                            <td className="p-3 text-sm">
                              <p className="font-medium truncate max-w-[120px]">{o.readerDetails?.name || '—'}</p>
                              <p className="text-xs text-gray-400 truncate">{o.readerDetails?.email}</p>
                            </td>
                            <td className="p-3 text-xs text-gray-500 max-w-[140px]">
                              <p className="truncate">{o.readerDetails?.address}</p>
                              <p className="truncate">{o.readerDetails?.city} {o.readerDetails?.zip}</p>
                            </td>
                            <td className="p-3 text-sm text-center">{o.quantity || 1}</td>
                            <td className="p-3 text-sm font-bold">₪{o.totalPaid}</td>
                            <td className="p-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(getTs(o))}</td>
                            <td className="p-3">
                              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border w-fit ${statusColor(o.status)}`}>
                                {statusIcon(o.status)}{statusLabel(o.status)}
                              </span>
                            </td>
                            <td className="p-3">
                              <button onClick={() => handleDeleteOrder(o.id)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors">
                                <Trash2 size={14}/>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td colSpan={5} className="p-3 text-xs font-bold text-gray-600">
                            סה״כ: {author.orders.length} הזמנות · {sold} ספרים
                          </td>
                          <td className="p-3 text-sm font-black text-gray-900">₪{revenue.toLocaleString()}</td>
                          <td colSpan={3}/>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile list */}
                  <div className="sm:hidden divide-y divide-gray-100">
                    {author.orders.map(o => (
                      <div key={o.id} className={`p-4 ${selected.has(o.id) ? 'bg-red-50' : ''}`}>
                        <div className="flex items-start gap-3">
                          <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)} className="rounded mt-1"/>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{o.bookTitle||o.bookId||'ספר'}</p>
                            <p className="text-xs text-gray-500">{o.readerDetails?.name} · ₪{o.totalPaid}</p>
                            <p className="text-xs text-gray-400">{o.readerDetails?.city} · {fmtDate(getTs(o))}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor(o.status)}`}>
                              {statusIcon(o.status)}{statusLabel(o.status)}
                            </span>
                            <button onClick={() => handleDeleteOrder(o.id)} className="text-red-400 hover:text-red-600 p-1 rounded">
                              <Trash2 size={13}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Mobile summary */}
                    <div className="p-4 bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-600">
                      <span>{author.orders.length} הזמנות · {sold} ספרים</span>
                      <span className="text-gray-900 text-sm">₪{revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {byAuthor.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <ShoppingBag size={40} className="text-gray-200 mx-auto mb-3"/>
            <p className="text-gray-400 font-medium">אין הזמנות עדיין</p>
          </div>
        )}
      </div>
    </div>
  );
}

