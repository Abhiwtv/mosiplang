import { useEffect, useState } from 'react';
import { Search, FileText, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRole } from '../contexts/RoleContext';
import type { Batch } from '../types';

interface InspectionFormData {
  [key: string]: string | boolean;
  moistureLevel: string;
  pesticideContent: string;
  heavyMetals: string;
  aflatoxin: string;
  microbialLoad: string;
  organicStatus: boolean;
  qualityGrade: string;
  notes: string;
}

const TEST_FIELD_MAP: Record<string, { key: keyof InspectionFormData; label: string; type: 'number' | 'text'; unit?: string; placeholder?: string }> = {
  'Moisture Content': { key: 'moistureLevel', label: 'Moisture Level', type: 'number', unit: '%', placeholder: 'e.g., 12.5' },
  'Pesticide Residue': { key: 'pesticideContent', label: 'Pesticide Content', type: 'number', unit: 'ppm', placeholder: 'e.g., 0.15' },
  'Heavy Metals': { key: 'heavyMetals', label: 'Heavy Metals', type: 'number', unit: 'ppm', placeholder: 'e.g., 0.05' },
  'Aflatoxin': { key: 'aflatoxin', label: 'Aflatoxin Level', type: 'number', unit: 'ppb', placeholder: 'e.g., 4.2' },
  'Microbial Load': { key: 'microbialLoad', label: 'Microbial Load', type: 'text', placeholder: 'e.g., 10^3 CFU/g' },
  'Organic Certification': { key: 'organicStatus', label: 'Organic Certified', type: 'number' },
};

export function InspectionRequests() {
  const t = useTranslations('inspectionRequests');
  const { userName } = useRole();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<Batch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState<InspectionFormData>({
    moistureLevel: '',
    pesticideContent: '',
    heavyMetals: '',
    aflatoxin: '',
    microbialLoad: '',
    organicStatus: false,
    qualityGrade: '',
    notes: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = batches.filter(batch =>
        batch.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.exporter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.crop_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBatches(filtered);
    } else {
      setFilteredBatches(batches);
    }
  }, [searchTerm, batches]);

  async function loadBatches() {
    try {
      const response = await fetch('/api/inspections/pending');
      if (!response.ok) throw new Error('Failed to fetch batches');
      
      const data = await response.json();
      setBatches(data);
      setFilteredBatches(data);
    } catch (error) {
      console.error("Error loading batches:", error);
    }
  }

  function openInspectionModal(batch: Batch) {
    setSelectedBatch(batch);
    setShowModal(true);
    setFormData({
      moistureLevel: '',
      pesticideContent: '',
      heavyMetals: '',
      aflatoxin: '',
      microbialLoad: '',
      organicStatus: false,
      qualityGrade: '',
      notes: '',
    });
  }

  function closeModal() {
    setShowModal(false);
    setSelectedBatch(null);
  }

  async function handleSubmitInspection(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBatch) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/inspections/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: selectedBatch.id,
          inspectorName: userName,
          moisture: formData.moistureLevel,
          pesticide: formData.pesticideContent,
          heavyMetals: formData.heavyMetals,
          aflatoxin: formData.aflatoxin,
          microbialLoad: formData.microbialLoad,
          organic: formData.organicStatus,
          grade: formData.qualityGrade,
          notes: formData.notes
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Inspection failed');
      }

      await loadBatches();
      closeModal();
      alert(t('alerts.success'));

    } catch (error: any) {
      console.error("Submission error:", error);
      alert(`${t('alerts.error')}: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  function getStatusBadge(status: string) {
    const styles = {
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      in_progress: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    const key = status.toLowerCase() as keyof typeof styles;
    return styles[key] || styles.pending;
  }

  function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const requestedTests = selectedBatch?.tests || [];
  const hasOrganicTest = requestedTests.includes('Organic Certification');

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{t('title')}</h1>
          <p className="text-sm text-slate-600 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg">
        <div className="p-6 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-slate-600 placeholder:text-slate-300 w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('table.batchId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('table.exporter')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('table.cropType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('table.testsRequired')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('table.quantity')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('table.dateSubmitted')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t('table.action')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{batch.batch_number}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700">{batch.exporter_name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700">{batch.crop_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(batch.tests && batch.tests.length > 0) ? (
                        batch.tests.slice(0, 2).map((test, idx) => (
                          <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                            {test}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">{t('standardTests')}</span>
                      )}
                      {batch.tests && batch.tests.length > 2 && (
                        <span className="text-xs text-slate-500">+{batch.tests.length - 2} {t('more')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700">{(batch.quantity_kg / 1000).toFixed(1)}t</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-700">{formatDate(batch.submitted_at)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(batch.status)}`}>
                      {batch.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openInspectionModal(batch)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      {t('recordResults')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBatches.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">{t('noRequests')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedBatch && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('modal.title')}</h2>
                <p className="text-sm text-slate-600 mt-1">{t('modal.batch')}: {selectedBatch.batch_number}</p>
              </div>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitInspection} className="p-6 space-y-6">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">{t('modal.exporter')}:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedBatch.exporter_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">{t('modal.crop')}:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedBatch.crop_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">{t('modal.quantity')}:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedBatch.quantity_kg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-600">{t('modal.location')}:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedBatch.location}</span>
                  </div>
                </div>
                {requestedTests.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-2">{t('modal.requestedTests')}:</p>
                    <div className="flex flex-wrap gap-2">
                      {requestedTests.map((test, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {test}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Test Fields */}
              <div className="grid grid-cols-2 gap-6">
                {requestedTests
                  .filter(test => test !== 'Organic Certification')
                  .map((testName) => {
                    const field = TEST_FIELD_MAP[testName];
                    if (!field) return null;

                    return (
                      <div key={testName}>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {field.label} {field.unit && `(${field.unit})`} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type={field.type}
                          step="0.01"
                          required
                          value={formData[field.key] as string}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="text-slate-600 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                      </div>
                    );
                  })}
              </div>

              {/* Quality Grade */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('modal.qualityGrade')} <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.qualityGrade}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualityGrade: e.target.value }))}
                  className="text-slate-700 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">{t('modal.selectGrade')}</option>
                  <option value="A">{t('modal.gradeA')}</option>
                  <option value="B">{t('modal.gradeB')}</option>
                  <option value="C">{t('modal.gradeC')}</option>
                </select>
              </div>

              {/* Organic Checkbox */}
              {hasOrganicTest && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.organicStatus}
                      onChange={(e) => setFormData(prev => ({ ...prev, organicStatus: e.target.checked }))}
                      className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm font-medium text-slate-700">{t('modal.organicCertified')}</span>
                  </label>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {t('modal.notes')}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('modal.notesPlaceholder')}
                  rows={4}
                  className="text-slate-500 w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {t('modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('modal.submitting') : t('modal.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}