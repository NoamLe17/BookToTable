'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import {
  Users, BookOpen, ShoppingBag, TrendingUp,
  ArrowUp, ArrowDown, Minus, Calendar,
} from 'lucide-react';

type Period = '1d' | '7d' | '30d' | '90d' | '365d' | 'all';

const PERIODS: { key: Period; label: string }[] = [
  { key: '1d',   label: 'היום' },
  { key: '7d',   label: '7 ימים' },
  { key: '30d',  label: '30 יום' },
  { key: '90d',  label: '3 חודשים' },
  { key: '365d', label: 'שנה' },
  { key: 'all',  label: 'הכל' },
];

function getPeriodMs(period: Period): number | null {
  const map: Record<Period, number | null> = {
    '1d': 86400000, '7d': 7*86400000, '30d': 30*86400000,
    '90d': 90*86400000, '365d': 365*86400000, 'all': null,
  };
  return map[period];
}

function getTs(item: any): number {
  if (typeof item.createdAt === 'number') return item.createdAt;
  if (item.createdAt?.toMillis) return item.createdAt.toMillis();
  return 0;
}

function filterCurrent<T>(items: T[], period: Period): T[] {
  const ms = getPeriodMs(period);
  if (!ms) return items;
  const cutoff = Date.now() - ms;
  return items.filter(i => getTs(i) >= cutoff);
}

function filterPrev<T>(items: T[], period: Period): T[] {
  const ms = getPeriodMs(period);
  if (!ms) return [];
  const now = Date.now();
  return items.filter(i => { const t = getTs(i); return t >= now - ms*2 && t < now - ms; });
}

function fmtDate(ms: number) {
  return new Date(ms).toLocaleDateString('he-IL', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });
}

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (cur === 0 && prev === 0) return <span className="text-gray-400 text-xs flex items-center gap-0.5"><Minus size={11}/>0%</span>;
  if (prev === 0) return <span className="text-green-600 text-xs font-bold flex items-center gap-0.5"><ArrowUp size={11}/>חדש</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  return (
    <span className={`text-xs font-bold flex items-center gap-0.5 ${pct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
      {pct >= 0 ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}{Math.abs(pct)}%
    </span>
  );
}

const statusLabel = (s: string) => ({ pending:'ממתין', shipped:'נשלח', delivered:'הגיע', pending_payment:'ממתין לתשלום', cancelled:'בוטל' }[s] ?? s);
const statusColor = (s: string) => ({ pending:'bg-yellow-100 text-yellow-700', shipped:'bg-blue-100 text-blue-700', delivered:'bg-green-100 text-green-700', pending_payment:'bg-orange-100 text-orange-700', cancelled:'bg-red-100 text-red-700' }[s] ?? 'bg-gray-100 text-gray-600');

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [users, setUsers] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let n = 0;
    const done = () => { if (++n >= 3) setLoading(false); };
    const u1 = onSnapshot(query(collection(db,'users'), orderBy('createdAt','desc')), s => { setUsers(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });
    const u2 = onSnapshot(query(collection(db,'books'), orderBy('createdAt','desc')), s => { setBooks(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });
    const u3 = onSnapshot(query(collection(db,'orders'), orderBy('createdAt','desc')), s => { setOrders(s.docs.map(d=>({id:d.id,...d.data()}))); done(); });
    return () => { u1(); u2(); u3(); };
  }, []);

  const curU = useMemo(() => filterCurrent(users, period), [users, period]);
  const prevU = useMemo(() => filterPrev(users, period), [users, period]);
  const curB = useMemo(() => filterCurrent(books, period), [books, period]);
  const prevB = useMemo(() => filterPrev(books, period), [books, period]);
  const curO = useMemo(() => filterCurrent(orders, period), [orders, period]);
  const prevO = useMemo(() => filterPrev(orders, period), [orders, period]);
  const curRev = useMemo(() => curO.reduce((s,o) => s+(o.totalPaid||0), 0), [curO]);
  const prevRev = useMemo(() => prevO.reduce((s,o) => s+(o.totalPaid||0), 0), [prevO]);

  const dailyRevenue = useMemo(() => {
    const ms = getPeriodMs(period) ?? 30*86400000;
    const daysCount = Math.min(Math.round(ms/86400000), 30);
    const days: Record<string,number> = {};
    for (let i = daysCount-1; i >= 0; i--) {
      const k = new Date(Date.now()-i*86400000).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit'});
      days[k] = 0;
    }
    curO.forEach(o => {
      const k = new Date(getTs(o)).toLocaleDateString('he-IL',{day:'2-digit',month:'2-digit'});
      if (k in days) days[k] += (o.totalPaid||0);
    });
    return Object.entries(days);
  }, [curO, period]);

  const maxRev = Math.max(...dailyRevenue.map(([,v])=>v), 1);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-3"/>
        <p className="text-gray-500 font-medium">טוען נתונים...</p>
      </div>
    </div>
  );

  const kpis = [
    { label:'משתמשים חדשים', cur:curU.length,  prev:prevU.length,  icon:Users,       light:'bg-blue-50 text-blue-700',    val:curU.length.toString() },
    { label:'ספרים חדשים',   cur:curB.length,  prev:prevB.length,  icon:BookOpen,    light:'bg-emerald-50 text-emerald-700', val:curB.length.toString() },
    { label:'הזמנות',        cur:curO.length,  prev:prevO.length,  icon:ShoppingBag, light:'bg-purple-50 text-purple-700', val:curO.length.toString() },
    { label:'הכנסה',         cur:curRev,       prev:prevRev,       icon:TrendingUp,  light:'bg-orange-50 text-orange-700', val:`₪${curRev.toLocaleString()}` },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header + Period */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <TrendingUp size={26} className="text-red-600"/>אנליטיקס
          </h1>
          <p className="text-gray-500 mt-1 text-sm">נתוני פעילות שוטפים באתר</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5 shadow-sm overflow-x-auto">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${period===p.key ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.light}`}>
                <k.icon size={18}/>
              </div>
              {period !== 'all' && <Delta cur={k.cur} prev={k.prev}/>}
            </div>
            <p className="text-2xl sm:text-3xl font-black text-gray-900">{k.val}</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{k.label}</p>
            {period !== 'all' && <p className="text-xs text-gray-400 mt-1">לעומת {k.prev} קודם</p>}
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      {dailyRevenue.some(([,v])=>v>0) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Calendar size={15} className="text-orange-500"/>הכנסה יומית (₪)
          </h2>
          <div className="flex items-end gap-1 h-32 overflow-x-auto pb-2">
            {dailyRevenue.map(([day,val]) => (
              <div key={day} className="flex flex-col items-center gap-1 flex-1 min-w-[18px]">
                <div className="w-full rounded-t-md bg-gradient-to-t from-orange-500 to-orange-300 hover:from-orange-600 hover:to-orange-400 transition-all relative group"
                  style={{height:`${Math.max((val/maxRev)*100, val>0?4:0)}%`}}>
                  {val>0 && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      ₪{val}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 whitespace-nowrap">{day}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three columns */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Users */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-blue-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-blue-800 flex items-center gap-1.5"><Users size={14}/>משתמשים חדשים</h2>
            <span className="text-xs font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">{curU.length}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {curU.slice(0,20).map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-black text-xs shrink-0">{(u.name||'?')[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{u.name||'ללא שם'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{u.email}</p>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">{fmtDate(getTs(u))}</span>
              </div>
            ))}
            {curU.length===0 && <p className="p-6 text-center text-gray-400 text-sm">אין משתמשים בתקופה זו</p>}
          </div>
        </div>

        {/* Books */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-emerald-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5"><BookOpen size={14}/>ספרים שהועלו</h2>
            <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">{curB.length}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {curB.slice(0,20).map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                {b.coverUrl
                  ? <img src={b.coverUrl} alt={b.title} className="w-8 h-11 object-cover rounded shrink-0"/>
                  : <div className="w-8 h-11 bg-gray-100 rounded flex items-center justify-center shrink-0"><BookOpen size={12} className="text-gray-400"/></div>}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{b.title}</p>
                  <p className="text-[10px] text-gray-400 truncate">{b.authorName} · ₪{b.price}</p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${b.isPublished?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>
                  {b.isPublished?'פורסם':'טיוטה'}
                </span>
              </div>
            ))}
            {curB.length===0 && <p className="p-6 text-center text-gray-400 text-sm">אין ספרים בתקופה זו</p>}
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-purple-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-purple-800 flex items-center gap-1.5"><ShoppingBag size={14}/>הזמנות</h2>
            <span className="text-xs font-bold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{curO.length}</span>
          </div>
          <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
            {curO.slice(0,20).map(o => (
              <div key={o.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{o.bookTitle||o.bookId||'ספר'}</p>
                  <p className="text-[10px] text-gray-400 truncate">{o.readerDetails?.name} · ₪{o.totalPaid}</p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${statusColor(o.status)}`}>
                  {statusLabel(o.status)}
                </span>
              </div>
            ))}
            {curO.length===0 && <p className="p-6 text-center text-gray-400 text-sm">אין הזמנות בתקופה זו</p>}
          </div>
        </div>
      </div>

      {/* Order status breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4">פירוט סטטוס הזמנות — {PERIODS.find(p=>p.key===period)?.label}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['pending','shipped','delivered','cancelled'].map(s => {
            const count = curO.filter(o => o.status===s || (s==='pending' && o.status==='pending_payment')).length;
            return (
              <div key={s} className={`rounded-xl p-3 text-center ${statusColor(s)}`}>
                <p className="text-2xl font-black">{count}</p>
                <p className="text-xs font-bold mt-0.5">{statusLabel(s)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

