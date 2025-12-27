// /app/verify/[certId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  CheckCircle,
  ExternalLink,
  AlertCircle,
  X,
  Calendar,
  Package,
  Eye
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

export default function VerifyPage() {
  const { certId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!certId) return;
    fetch(`/api/verify/${certId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch certificate");
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [certId]);

  function formatDate(dateString: string | null) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Error</h2>
          </div>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center mt-20 text-gray-500">
        Certificate not found.
      </div>
    );
  }

  const isExpired = data.is_expired;
  const quality = data.quality_metrics || {};

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Digital Certificate Verification
          </h1>
          <p className="text-gray-600 mt-1">
            {isExpired ? "⚠️ This certificate has expired" : "Verified certificate"}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full border ${
            isExpired
              ? "bg-red-500/20 text-red-800 border-red-500/30"
              : "bg-emerald-400/20 text-emerald-800 border-emerald-400/30"
          }`}
        >
          {isExpired ? "Expired" : "Valid"}
        </span>
      </div>

      {/* QR Code & Core Info */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="bg-white p-3 border border-gray-200 rounded-xl shadow-sm mx-auto sm:mx-0">
          {data.verification_urls?.inji_verify ? (
            <QRCodeSVG value={data.verification_urls.inji_verify} size={140} />
          ) : (
            <div className="w-[140px] h-[140px] bg-gray-100 flex items-center justify-center text-xs text-gray-400 rounded-lg">
              No QR Data
            </div>
          )}
        </div>

        <div className="flex-1 space-y-4 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                Batch Number
              </p>
              <p className="text-base font-bold text-gray-900">{data.batch_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">
                Product
              </p>
              <p className="text-base font-bold text-gray-900">{data.product.type}</p>
            </div>
          </div>

          {data.verification_urls?.inji_verify && (
            <a
              href={data.verification_urls.inji_verify}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline decoration-blue-200 underline-offset-4"
            >
              <ExternalLink className="w-4 h-4" />
              Verify Legitimacy on Blockchain
            </a>
          )}
        </div>
      </div>

      {/* Quality Metrics */}
      {quality && (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 uppercase mb-4 tracking-wide">
            Quality Inspection Data
          </h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600 text-sm">Moisture Content</span>
              <span className="font-semibold text-gray-900">{quality.moisture || "0"}%</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600 text-sm">Pesticide Residue</span>
              <span className="font-semibold text-gray-900">{quality.pesticide_residue || "0"} ppm</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600 text-sm">Quality Grade</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 rounded">
                Grade {quality.grade || "A"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <span className="text-gray-600 text-sm">Organic Certified</span>
              <span className={`font-semibold ${quality.organic ? "text-emerald-600" : "text-gray-900"}`}>
                {quality.organic ? "Yes" : "No"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Logistics & Origin */}
      {data.product && (
        <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-sm font-bold text-blue-900 uppercase mb-4 tracking-wide">
            Logistics & Origin
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-500 font-medium text-xs mb-1">Origin</p>
              <p className="text-blue-900 font-semibold">{data.product.origin || "N/A"}</p>
            </div>
            <div>
              <p className="text-blue-500 font-medium text-xs mb-1">Destination</p>
              <p className="text-blue-900 font-semibold">{data.product.destination || "N/A"}</p>
            </div>
            <div>
              <p className="text-blue-500 font-medium text-xs mb-1">Quantity</p>
              <p className="text-blue-900 font-semibold">
                {data.product.quantity || "0"} {data.product.unit || "kg"}
              </p>
            </div>
            <div>
              <p className="text-blue-500 font-medium text-xs mb-1">Harvest Date</p>
              <p className="text-blue-900 font-semibold">{formatDate(data.product.harvest_date)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Issuer Info */}
      {data.issuer && (
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Cryptographically signed by{" "}
            <span className="font-medium text-gray-600">{data.issuer.name}</span>
          </p>
          {data.issuer.did && (
            <p className="text-[10px] text-gray-300 font-mono mt-1 break-all px-8">
              {data.issuer.did}
            </p>
          )}
        </div>
      )}

      {/* Warnings */}
      {data.warnings && data.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          {data.warnings.map((w: string, i: number) => (
            <p key={i}>{w}</p>
          ))}
        </div>
      )}
    </div>
  );
}
