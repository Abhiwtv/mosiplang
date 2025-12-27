'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';

interface DigitalPassport {
    id: string;
    cropType: string;
    quantity: string;
    unit: string;
    harvestDate: string;
    destinationCountry: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'CERTIFIED';
    labReports: string[];
    farmPhotos: string[];
}

export default function DigitalPassports() {
    const t = useTranslations('digitalPassports');

    const [passports, setPassports] = useState<DigitalPassport[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [viewDetail, setViewDetail] = useState<DigitalPassport | null>(null);

    useEffect(() => {
        fetchPassports();
    }, []);

    const fetchPassports = async () => {
        setDataLoading(true);
        setApiError(null);
        try {
            const res = await fetch('/api/passports');
            if (!res.ok) throw new Error(t('errorLoading'));
            const data = await res.json();
            
            const mapped: DigitalPassport[] = data.map((d: any) => ({
                id: d.id,
                cropType: d.crop_type || d.cropType || 'Unknown',
                quantity: d.quantity?.toString() || d.batch_details?.quantity?.toString() || '0',
                unit: d.unit || d.batch_details?.unit || 'kg',
                harvestDate: d.issued_at ? new Date(d.issued_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                destinationCountry: d.batch_details?.destination || 'Unknown',
                status: d.batch_details?.status || 'APPROVED',
                labReports: [],
                farmPhotos: [],
            }));
            setPassports(mapped);
        } catch (err) {
            console.error(err);
            setApiError(t('errorLoading'));
        } finally {
            setDataLoading(false);
        }
    };

    const openDetail = (passport: DigitalPassport) => setViewDetail(passport);
    const closeDetail = () => setViewDetail(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED':
            case 'CERTIFIED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'REJECTED': return 'bg-rose-100 text-rose-800 border-rose-200';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    if (dataLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold text-slate-900">{t('title')}</h1>
            </div>

            <p className="text-slate-500">{t('description')}</p>

            {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{apiError}</p>
                </div>
            )}

            {!viewDetail && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {passports.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-slate-500">{t('noPassports')}</p>
                        </div>
                    ) : (
                        passports.map(p => (
                            <div 
                                key={p.id} 
                                className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer" 
                                onClick={() => openDetail(p)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900">{p.cropType}</h3>
                                        <p className="text-sm text-slate-600">{p.quantity} {p.unit}</p>
                                    </div>
                                    <span className={`px-3 py-1 border rounded-full text-xs font-medium ${getStatusColor(p.status)}`}>
                                        {t(`status.${p.status.toLowerCase()}`)}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <p><span className="font-medium">{t('labels.harvestDate')}:</span> {p.harvestDate}</p>
                                    <p><span className="font-medium">{t('labels.destination')}:</span> {p.destinationCountry}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {viewDetail && (
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                    <button 
                        onClick={closeDetail} 
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('buttons.back')}
                    </button>

                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{viewDetail.cropType}</h2>
                            <p className="text-slate-600 mt-1">{viewDetail.quantity} {viewDetail.unit}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-200">
                            <div>
                                <p className="text-sm text-slate-500">{t('labels.harvestDate')}</p>
                                <p className="font-semibold text-slate-900">{viewDetail.harvestDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">{t('labels.destination')}</p>
                                <p className="font-semibold text-slate-900">{viewDetail.destinationCountry}</p>
                            </div>
                        </div>

                        <div>
                            <span className={`inline-block px-4 py-2 border rounded-lg ${getStatusColor(viewDetail.status)}`}>
                                {t(`status.${viewDetail.status.toLowerCase()}`)}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('labels.labReports')}</h3>
                            {viewDetail.labReports.length > 0 ? (
                                <ul className="space-y-2">
                                    {viewDetail.labReports.map((r, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-700">
                                            <FileText size={16} className="text-slate-400" />
                                            {r}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500">{t('labels.none')}</p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">{t('labels.farmPhotos')}</h3>
                            {viewDetail.farmPhotos.length > 0 ? (
                                <ul className="space-y-2">
                                    {viewDetail.farmPhotos.map((p, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-700">
                                            <ImageIcon size={16} className="text-slate-400" />
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500">{t('labels.none')}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}