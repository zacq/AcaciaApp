import React from 'react';
import { 
  Users, 
  Briefcase, 
  Stethoscope, 
  Activity, 
  ArrowLeftRight, 
  Weight, 
  Tag, 
  Skull, 
  ClipboardList,
  Baby,
  Trash2,
  ShoppingBag,
  Scan,
  Clock,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

const reports = [
  { icon: Users, label: 'Animals in Flock', path: '/app/reporting/animals-in-flock' },
  { icon: Users, label: 'Animals by Group', path: '/app/reporting/animals-by-group' },
  { icon: ShoppingBag, label: 'Medicines Purchased', path: '/app/reporting/medicines-purchased' },
  { icon: Stethoscope, label: 'Treatments', path: '/app/reporting/treatments' },
  { icon: ClipboardList, label: 'Service Report', path: '/app/reporting/service-report' },
  { icon: ArrowLeftRight, label: 'Movements', path: '/app/reporting/movements' },
  { icon: Weight, label: 'Weight Recording', path: '/app/reporting/weight-recording' },
  { icon: Tag, label: 'Replaced Tags', path: '/app/reporting/replaced-tags' },
  { icon: Skull, label: 'Mortality Report', path: '/app/reporting/mortality' },
  { icon: Activity, label: 'Health Assessment Report', path: '/app/reporting/health-assessment' },
  { icon: Baby, label: 'Animals Born on Farm', path: '/app/reporting/animals-born-on-farm' },
  { icon: Baby, label: 'Lambing Record', path: '/app/reporting/lambing-record' },
  { icon: Trash2, label: 'Cull Report', path: '/app/reporting/cull-report' },
  { icon: Scan, label: 'Pregnancy Scan Report', path: '/app/reporting/pregnancy-scan' },
  { icon: Clock, label: 'Expired Medicines', path: '/app/reporting/expired-medicines' },
  { icon: AlertTriangle, label: 'Animals in Withdrawal', path: '/app/reporting/animals-in-withdrawal' },
];

export default function Reporting() {
  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-serif text-primary">Reporting</h2>
      
      <div className="space-y-2">
        {reports.map((report) => (
          <button 
            key={report.label}
            className="w-full card flex items-center justify-between py-4 group hover:bg-accent/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary-light group-hover:text-primary transition-colors">
                <report.icon size={20} />
              </div>
              <span className="font-bold text-primary-dark">{report.label}</span>
            </div>
            <ChevronRight size={20} className="text-accent group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
