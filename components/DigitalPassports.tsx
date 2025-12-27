'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, FileText, Image as ImageIcon } from 'lucide-react';
import { useRole } from '../contexts/RoleContext';

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
    const { userEmail } = useRole();

    const [passports, setPassports] = useState<DigitalPassport[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);
    const [viewDetail, setViewDetail] = useState<DigitalPassport | null>(null);

    const fetchPassports = async () => {
        setDataLoading(true);
        setApiError(null);
        try {
            const res = await fetch('/api/digital-passports');
            if (!res.ok) throw new Error(t('errors.fetchFailed'));
            const data = await res.json();
            const mapped: DigitalPassport[] = data.map((d: any) => ({
                id: d.id,
                cropType: d.cropType,
                quantity: d.quantity,
                unit: d.unit,
                harvestDate: new Date(d.harvestDate).toISOString().split('T')[0],
                destinationCountry: d.destinationCountry,
                status: d.status,
                labReports: d.tests || [],
                farmPhotos: [],
            }));
            setPassports(mapped);
        } catch (err) {
            console.error(err);
            setApiError(t('errors.couldNotLoad'));
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

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            {dataLoading && <p>{t('labels.loading')}</p>}
            {apiError && <p className="text-red-500">{apiError}</p>}

            {!viewDetail && (
                <ul className="mt-4">
                    {passports.map(p => (
                        <li key={p.id} className="border p-2 my-2 cursor-pointer" onClick={() => openDetail(p)}>
                            <div className="flex justify-between">
                                <span>{p.cropType} ({p.quantity} {p.unit})</span>
                                <span className={`px-2 py-1 border rounded ${getStatusColor(p.status)}`}>
                                    {t(`status.${p.status.toLowerCase()}`)}
                                </span>
                            </div>
                            <div className="text-sm text-gray-500">{p.harvestDate}</div>
                        </li>
                    ))}
                </ul>
            )}

            {viewDetail && (
                <div className="border p-4 rounded space-y-4">
                    <button onClick={closeDetail} className="flex items-center gap-1 text-blue-500">
                        <ArrowLeft /> {t('buttons.back')}
                    </button>

                    <h2 className="text-xl font-bold">{viewDetail.cropType}</h2>
                    <p>{t('labels.quantity')}: {viewDetail.quantity} {viewDetail.unit}</p>
                    <p>{t('labels.harvestDate')}: {viewDetail.harvestDate}</p>
                    <p>{t('labels.destination')}: {viewDetail.destinationCountry}</p>
                    <p className={`inline-block px-2 py-1 border rounded ${getStatusColor(viewDetail.status)}`}>
                        {t(`status.${viewDetail.status.toLowerCase()}`)}
                    </p>

                    <div>
                        <h3 className="font-semibold">{t('labels.labReports')}</h3>
                        {viewDetail.labReports.length > 0 ? (
                            <ul>
                                {viewDetail.labReports.map((r, i) => (
                                    <li key={i} className="flex items-center gap-1">
                                        <FileText size={16} /> {r}
                                    </li>
                                ))}
                            </ul>
                        ) : <p>{t('labels.none')}</p>}
                    </div>

                    <div>
                        <h3 className="font-semibold">{t('labels.farmPhotos')}</h3>
                        {viewDetail.farmPhotos.length > 0 ? (
                            <ul>
                                {viewDetail.farmPhotos.map((p, i) => (
                                    <li key={i} className="flex items-center gap-1">
                                        <ImageIcon size={16} /> {p}
                                    </li>
                                ))}
                            </ul>
                        ) : <p>{t('labels.none')}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
