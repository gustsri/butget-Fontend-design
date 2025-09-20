import { 
    Clock, 
    AlertCircle, 
    CheckCircle, 
    XCircle,
    FileText,
    Loader2
} from 'lucide-react';

export type DocumentStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'draft' | 'cancelled';

interface StatusBadgeProps {
    status: DocumentStatus;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    animated?: boolean;
    className?: string;
}

export default function StatusBadge({ 
    status, 
    size = 'md', 
    showIcon = true, 
    animated = false,
    className = ''
}: StatusBadgeProps) {
    
    const getStatusConfig = (status: DocumentStatus) => {
        const configs = {
            pending: {
                text: 'รอดำเนินการ',
                bgColor: 'bg-yellow-100',
                textColor: 'text-yellow-800',
                borderColor: 'border-yellow-200',
                icon: Clock,
                pulseColor: 'animate-pulse'
            },
            under_review: {
                text: 'กำลังตรวจสอบ',
                bgColor: 'bg-blue-100',
                textColor: 'text-blue-800',
                borderColor: 'border-blue-200',
                icon: AlertCircle,
                pulseColor: 'animate-pulse'
            },
            approved: {
                text: 'อนุมัติแล้ว',
                bgColor: 'bg-green-100',
                textColor: 'text-green-800',
                borderColor: 'border-green-200',
                icon: CheckCircle,
                pulseColor: ''
            },
            rejected: {
                text: 'ไม่อนุมัติ',
                bgColor: 'bg-red-100',
                textColor: 'text-red-800',
                borderColor: 'border-red-200',
                icon: XCircle,
                pulseColor: ''
            },
            draft: {
                text: 'ฉบับร่าง',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-800',
                borderColor: 'border-gray-200',
                icon: FileText,
                pulseColor: ''
            },
            cancelled: {
                text: 'ยกเลิก',
                bgColor: 'bg-gray-100',
                textColor: 'text-gray-600',
                borderColor: 'border-gray-200',
                icon: XCircle,
                pulseColor: ''
            }
        };
        
        return configs[status] || configs.pending;
    };

    const getSizeClasses = (size: string) => {
        const sizes = {
            sm: {
                container: 'px-2 py-1 text-xs',
                icon: 'w-3 h-3',
                gap: 'space-x-1'
            },
            md: {
                container: 'px-3 py-1 text-sm',
                icon: 'w-4 h-4',
                gap: 'space-x-1.5'
            },
            lg: {
                container: 'px-4 py-2 text-base',
                icon: 'w-5 h-5',
                gap: 'space-x-2'
            }
        };
        
        return sizes[size as keyof typeof sizes] || sizes.md;
    };

    const config = getStatusConfig(status);
    const sizeClasses = getSizeClasses(size);
    const IconComponent = config.icon;

    const baseClasses = `
        inline-flex items-center
        ${sizeClasses.gap}
        ${sizeClasses.container}
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
        border
        rounded-full
        font-medium
        ${animated && (status === 'pending' || status === 'under_review') ? config.pulseColor : ''}
        ${className}
    `.trim().replace(/\s+/g, ' ');

    // Special animation for processing states
    const ProcessingIcon = () => {
        if (animated && (status === 'under_review')) {
            return <Loader2 className={`${sizeClasses.icon} animate-spin`} />;
        }
        return <IconComponent className={sizeClasses.icon} />;
    };

    return (
        <span className={baseClasses}>
            {showIcon && <ProcessingIcon />}
            <span>{config.text}</span>
        </span>
    );
}

// Hook สำหรับใช้งานร่วมกับสถิติ
export function useStatusStats(documents: Array<{ currentStatus: DocumentStatus }>) {
    const stats = documents.reduce((acc, doc) => {
        acc[doc.currentStatus] = (acc[doc.currentStatus] || 0) + 1;
        return acc;
    }, {} as Record<DocumentStatus, number>);

    return {
        pending: stats.pending || 0,
        under_review: stats.under_review || 0,
        approved: stats.approved || 0,
        rejected: stats.rejected || 0,
        draft: stats.draft || 0,
        cancelled: stats.cancelled || 0,
        total: documents.length
    };
}

// Component สำหรับแสดงสถิติ
interface StatusStatsProps {
    stats: ReturnType<typeof useStatusStats>;
    className?: string;
}

export function StatusStats({ stats, className = '' }: StatusStatsProps) {
    const statusList: Array<{ key: DocumentStatus; label: string }> = [
        { key: 'pending', label: 'รอดำเนินการ' },
        { key: 'under_review', label: 'กำลังตรวจสอบ' },
        { key: 'approved', label: 'อนุมัติแล้ว' },
        { key: 'rejected', label: 'ไม่อนุมัติ' }
    ];

    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
            {statusList.map(({ key, label }) => (
                <div key={key} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <StatusBadge status={key} size="sm" />
                        <span className="text-2xl font-bold text-gray-900">
                            {stats[key]}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{label}</p>
                </div>
            ))}
        </div>
    );
}