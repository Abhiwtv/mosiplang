'use client';

import { useEffect, useState } from 'react';
import { Plus, ClipboardCheck, Package, Clock, TrendingUp, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Batch {
  id: string;
  batchNumber: string;
  cropType: string;
  destinationCountry: string;
  status: string;
  createdAt: string;
  quantity: number;
  unit: string;
}

interface BatchData {
  stats: {
    totalBatches: number;
    approved: number;
    pending: number;
    avgProcessingTime: string;
  };
  batches: Array<{
    batchId: string;
    crop: string;
    destination: string;
    status: 'approved' | 'pending';
    date: string;
  }>;
  recentActivity: { id: string; description: string; time: string; status: string }[];
}

interface NewBatchForm {
  cropType: string;
  variety: string;
  quantity: string;
  unit: string;
  location: string;
  pinCode: string;
  harvestDate: string;
  destinationCountry: string;
  tests: string[];
}

const AVAILABLE_TESTS = [
  'Moisture Content',
  'Pesticide Residue',
  'Heavy Metals',
  'Aflatoxin',
  'Microbial Load',
  'Organic Certification'
];

export function BatchSubmission() {
  const t = useTranslations('batchSubmission');
  const [data, setData] = useState<BatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<NewBatchForm>({
    cropType: '',
    variety: 'Grade A',
    quantity: '',
    unit: 'kg',
    location: '',
    pinCode: '',
    harvestDate: '',
    destinationCountry: '',
    tests: []
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch('/api/batches');
      if (!res.ok) throw new Error('Failed to fetch batch data');
      const batches: Batch[] = await res.json();

      const approved = batches.filter(b => b.status === 'APPROVED').length;
      const pending = batches.filter(b => ['PENDING', 'IN_PROGRESS'].includes(b.status)).length;

      const formattedBatches = batches.slice(0, 10).map(b => ({
        batchId: b.batchNumber,
        crop: b.cropType,
        destination: b.destinationCountry,
        status: (b.status === 'APPROVED' ? 'approved' : 'pending') as 'approved' | 'pending',
        date: new Date(b.createdAt).toLocaleDateString('en-IN')
      }));

      const recentActivity = batches.slice(0, 5).map(b => ({
        id: b.id,
        description: `Batch ${b.batchNumber} - ${b.cropType} submitted`,
        time: new Date(b.createdAt).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: b.status === 'APPROVED' ? 'success' : 'warning'
      }));

      setData({
        stats: {
          totalBatches: batches.length,
          approved,
          pending,
          avgProcessingTime: '24h'
        },
        batches: formattedBatches,
        recentActivity
      });
    } catch (err) {
      console.error('BatchSubmission Error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create batch');

      // Reset form and reload data
      setFormData({
        cropType: '',
        variety: 'Grade A',
        quantity: '',
        unit: 'kg',
        location: '',
        pinCode: '',
        harvestDate: '',
        destinationCountry: '',
        tests: []
      });
      setShowModal(false);
      await loadData();
      alert('Batch created successfully!');
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to create batch. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function toggleTest(test: string) {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.includes(test)
        ? prev.tests.filter(t => t !== test)
        : [...prev.tests, test]
    }));
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-red-500">{t('errorLoading')}</div>
    );
  }

  const { stats, batches, recentActivity } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">{t('title')}</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('buttons.newBatch')}
        </button>
      </div>

      <p className="text-slate-500">{t('description')}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Batches */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('stats.totalBatches')}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.totalBatches}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-sm text-emerald-600">
            <TrendingUp className="w-4 h-4" />
            <span>{t('stats.active')}</span>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('stats.approved')}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">{t('stats.approvedDesc')}</div>
        </div>

        {/* Pending */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('stats.pending')}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">{t('stats.pendingDesc')}</div>
        </div>

        {/* Avg Processing Time */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">{t('stats.avgProcessingTime')}</p>
              <p className="text-3xl font-semibold text-slate-900 mt-2">{stats.avgProcessingTime}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-slate-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-slate-500">{t('stats.targetTime')}</div>
        </div>
      </div>

      {/* Bottom Grid: Table & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batches Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 overflow-x-auto">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('tableTitle')}</h2>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('table.batchId')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('table.crop')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('table.destination')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('table.status')}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">{t('table.date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500 text-sm">
                    {t('noData')}
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

      {/* New Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-xl font-semibold text-slate-900">Submit New Batch</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Crop Type <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cropType}
                    onChange={(e) => setFormData(prev => ({ ...prev, cropType: e.target.value }))}
                    placeholder="e.g., Basmati Rice"
                    className="text-slate-600 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Variety
                  </label>
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => setFormData(prev => ({ ...prev, variety: e.target.value }))}
                    placeholder="e.g., Grade A"
                    className="text-slate-600 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantity <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="1000"
                    className="text-slate-600 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="text-slate-700 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="ton">Tons</option>
                    <option value="quintal">Quintals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Location <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Punjab, India"
                    className="text-slate-600 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    value={formData.pinCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pinCode: e.target.value }))}
                    placeholder="400092"
                    className="text-slate-600 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Harvest Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.harvestDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, harvestDate: e.target.value }))}
                    className="text-slate-600 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Destination Country <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.destinationCountry}
                    onChange={(e) => setFormData(prev => ({ ...prev, destinationCountry: e.target.value }))}
                    placeholder="e.g., United States"
                    className="text-slate-600 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Required Tests
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_TESTS.map(test => (
                    <label key={test} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tests.includes(test)}
                        onChange={() => toggleTest(test)}
                        className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                      />
                      <span className="text-sm text-slate-700">{test}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}