import { useState } from 'react';
import { 
    Calendar, 
    DollarSign, 
    User, 
    Building2, 
    Eye,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import StatusBadge from './StatusBadge';

interface TimelineItem {
    status: string;
    date: string;
    actor: string;
    note: string;
}

interface TrackingDocument {
    id: number;
    documentNumber: string;
    title: string;
    type: string;
    submittedBy: string;
    submittedDate: string;
    currentStatus: string;
    totalBudget: number;
    department: string;
    approver?: string;
    approvedDate?: string;
    rejectedDate?: string;
    rejectionReason?: string;
    timeline: TimelineItem[];
}

interface TrackingListProps {
    documents: TrackingDocument[];
}

export default function TrackingList({ documents }: TrackingListProps) {
    const [expandedDoc, setExpandedDoc] = useState<number | null>(null);

    const formatBudget = (amount: number) => {
        return new Intl.NumberFormat('th-TH', {
            style: 'currency',
            currency: 'THB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'budget_plan':
                return 'แผนงบประมาณ';
            case 'expense_request':
                return 'การเบิกจ่าย';
            default:
                return type;
        }
    };

    const getTimelineStatusInfo = (status: string) => {
        switch (status) {
            case 'submitted':
                return {
                    text: 'ส่งเอกสาร',
                    color: 'bg-gray-500',
                    icon: <User className="w-3 h-3 text-white" />
                };
            case 'under_review':
                return {
                    text: 'ตรวจสอบ',
                    color: 'bg-blue-500',
                    icon: <Eye className="w-3 h-3 text-white" />
                };
            case 'approved':
                return {
                    text: 'อนุมัติ',
                    color: 'bg-green-500',
                    icon: <User className="w-3 h-3 text-white" />
                };
            case 'rejected':
                return {
                    text: 'ไม่อนุมัติ',
                    color: 'bg-red-500',
                    icon: <User className="w-3 h-3 text-white" />
                };
            default:
                return {
                    text: status,
                    color: 'bg-gray-500',
                    icon: <User className="w-3 h-3 text-white" />
                };
        }
    };

    const toggleExpanded = (docId: number) => {
        setExpandedDoc(expandedDoc === docId ? null : docId);
    };

    if (documents.length === 0) {
        return (
            <div className="p-12 text-center">
                <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบเอกสาร</h3>
                <p className="text-gray-500">ไม่มีเอกสารที่ตรงกับเงื่อนไขการค้นหา</p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-gray-200">
            {documents.map((doc) => {
                const isExpanded = expandedDoc === doc.id;
                
                return (
                    <div key={doc.id} className="p-6">
                        {/* Document Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                                    <StatusBadge status={doc.currentStatus} size="sm" animated={true} />
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-medium">
                                        {doc.documentNumber}
                                    </span>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                        {getTypeText(doc.type)}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleExpanded(doc.id)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                <span>{isExpanded ? 'ซ่อน' : 'ดู'}รายละเอียด</span>
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Document Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <div>
                                    <span className="text-gray-500">ผู้ส่ง: </span>
                                    <span className="font-medium">{doc.submittedBy}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <div>
                                    <span className="text-gray-500">วันที่ส่ง: </span>
                                    <span className="font-medium">{formatDate(doc.submittedDate)}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <DollarSign className="w-4 h-4 text-gray-400" />
                                <div>
                                    <span className="text-gray-500">จำนวนเงิน: </span>
                                    <span className="font-medium">{formatBudget(doc.totalBudget)}</span>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <Building2 className="w-4 h-4 text-gray-400" />
                                <div>
                                    <span className="text-gray-500">หน่วยงาน: </span>
                                    <span className="font-medium">{doc.department}</span>
                                </div>
                            </div>
                        </div>

                        {/* Approval Info */}
                        {(doc.approver || doc.rejectionReason) && (
                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                {doc.approver && (
                                    <div className="flex items-center space-x-2 text-sm mb-2">
                                        <span className="text-gray-500">ผู้อนุมัติ: </span>
                                        <span className="font-medium">{doc.approver}</span>
                                        {doc.approvedDate && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-500">{formatDate(doc.approvedDate)}</span>
                                            </>
                                        )}
                                    </div>
                                )}
                                {doc.rejectionReason && (
                                    <div className="text-sm">
                                        <span className="text-gray-500">เหตุผลไม่อนุมัติ: </span>
                                        <span className="text-red-700 font-medium">{doc.rejectionReason}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Timeline - Show when expanded */}
                        {isExpanded && (
                            <div className="mt-6 border-t pt-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">ประวัติการดำเนินการ</h4>
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    <div className="space-y-6">
                                        {doc.timeline.map((item, index) => {
                                            const timelineInfo = getTimelineStatusInfo(item.status);
                                            return (
                                                <div key={index} className="relative flex items-start space-x-4">
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${timelineInfo.color} flex items-center justify-center`}>
                                                        {timelineInfo.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {timelineInfo.text}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDateTime(item.date)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-1">{item.note}</p>
                                                        <p className="text-xs text-gray-500">โดย {item.actor}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}