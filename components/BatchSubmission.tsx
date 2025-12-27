'use client';

import { useEffect, useState } from 'react';
import { Plus, ClipboardCheck, Package, Clock, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Batch {
  batchId: string;
  crop: string;
  destination: string;
  status: 'approved' | 'pending';
  date: string;
}

interface BatchData {
  stats: {
    totalBatches: number;
    approved: number;
    pending: number;
    avgProcessingTime: string;
  };
  batches: Batch[];
  recentActivity: { id: string; description: string; time: string; status: string }[];
}

export function BatchSubmission() {
  const t = useTranslations();
  const [data, setData] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/batches');
        if (!res.ok) throw new Error('Failed to fetch batch data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('BatchSubmission Error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-red-500">{t('batchSubmission.errorLoading')}</div>;

  const { stats, batches, recentActivity } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">{t('batchSubmission.title')}</h1>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
          <Plus className="w-4 h-4" />
          {t('batchSubmission.buttons.newBatch')}
        </button>
      </div>

      <p className="text-slate-500">{t('batchSubmission.description')}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Batches */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('batchSubmission.stats.totalBatches')}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.totalBatches}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>{t('batchSubmission.stats.active')}</span>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('batchSubmission.stats.approved')}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">{t('batchSubmission.stats.approvedDesc')}</div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('batchSubmission.stats.pending')}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">{t('batchSubmission.stats.pendingDesc')}</div>
        </div>

        {/* Avg Processing Time */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('batchSubmission.stats.avgProcessingTime')}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.avgProcessingTime}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">{t('batchSubmission.stats.targetTime')}</div>
        </div>
      </div>

      {/* Bottom Grid: Table & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batches Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('batchSubmission.tableTitle')}</h2>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('batchSubmission.table.batchId')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('batchSubmission.table.crop')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('batchSubmission.table.destination')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('batchSubmission.table.status')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('batchSubmission.table.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 text-sm">
                    {t('batchSubmission.noData')}
                  </td>
                </tr>
              ) : (
                batches.map((batch) => (
                  <tr key={batch.batchId}>
                    <td className="px-6 py-4 text-sm text-slate-900">{batch.batchId}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{batch.crop}</td>
                    <td className="px-6 py-4 text-sm text-slate-900">{batch.destination}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-white text-xs font-medium ${
                          batch.status === 'approved' ? 'bg-emerald-600' : 'bg-amber-500'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">{batch.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-8">No recent activity</p>
            )}
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    activity.status === 'success' ? 'bg-emerald-600' :
                    activity.status === 'warning' ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-slate-900 font-medium">{activity.description}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
