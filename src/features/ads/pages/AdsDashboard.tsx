import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { useToast } from '../../../shared/context/ToastContext';
import { adsApi } from '../api/adsApi';
import type { AdsPlanResponse } from '../types/adsTypes';

export const AdsDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [plans, setPlans] = useState<AdsPlanResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      setPlans(await adsApi.getPlans());
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Cannot load ads plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlans();
  }, []);

  const successCount = plans.filter((plan) => plan.status === 'SUCCESS').length;
  const processingCount = plans.filter((plan) => plan.status === 'PROCESSING').length;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-display-lg font-bold text-on-surface">Facebook Ads</h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void fetchPlans()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 border border-border-base rounded-md font-body-sm font-bold hover:bg-state-hover transition-colors disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => navigate('/ads/create')}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-md font-body-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            Create ad
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-muted border border-border-base rounded-md p-4 flex flex-col gap-2">
          <span className="text-secondary font-body-sm">Plans</span>
          <span className="text-display-lg font-bold text-on-surface">{plans.length}</span>
        </div>
        <div className="bg-surface-muted border border-border-base rounded-md p-4 flex flex-col gap-2">
          <span className="text-secondary font-body-sm">Success</span>
          <span className="text-display-lg font-bold text-on-surface">{successCount}</span>
        </div>
        <div className="bg-surface-muted border border-border-base rounded-md p-4 flex flex-col gap-2">
          <span className="text-secondary font-body-sm">Processing</span>
          <span className="text-display-lg font-bold text-on-surface">{processingCount}</span>
        </div>
      </div>

      <div className="bg-surface-muted border border-border-base rounded-md overflow-hidden">
        <div className="p-4 border-b border-border-base">
          <h2 className="font-body-md font-bold">Ads plans</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-base text-secondary font-label-xs uppercase">
              <tr>
                <th className="p-4 font-medium">Plan ID</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Step</th>
                <th className="p-4 font-medium">Campaign</th>
                <th className="p-4 font-medium">Ads</th>
                <th className="p-4 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base font-body-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-secondary">
                    Loading ads plans...
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-secondary">
                    No ads plans yet
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-state-hover transition-colors">
                    <td className="p-4 font-medium text-on-surface">{plan.planId || plan.id}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-bold ${
                          plan.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-700'
                            : plan.status === 'FAILED'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {plan.status}
                      </span>
                    </td>
                    <td className="p-4 text-secondary">{plan.currentStep || '-'}</td>
                    <td className="p-4 text-secondary">{plan.fbCampaignId || '-'}</td>
                    <td className="p-4 text-secondary">
                      {plan.successCount ?? 0}/{plan.totalAds ?? 0}
                    </td>
                    <td className="p-4 text-secondary">
                      {new Date(plan.created_at || plan.createdAt || '').toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
