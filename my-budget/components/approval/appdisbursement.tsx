import { FileText, Calendar, DollarSign, ChevronRight } from 'lucide-react';

interface Document {
    id: number;
    title: string;
    year: string;
    quarter: number;
    status: string;
    totalBudget: number;
    departments: string[];
    createdDate: string;
    description: string;
}

interface DocumentListProps {
    documents: Document[];
    onDocumentClick: (documentId: number) => void;
}

export default function DocumentList({ documents, onDocumentClick }: DocumentListProps) {
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending':
                return 'รออนุมัติ';
            case 'approved':
                return 'อนุมัติแล้ว';
            case 'rejected':
                return 'ไม่อนุมัติ';
            default:
                return status;
        }
    };

    return (
        <div className="space-y-4">
            {documents.length === 0 ? (
                <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีเอกสารการเบิกจ่าย</h3>
                    <p className="text-gray-500">ขณะนี้ยังไม่มีเอกสารการเบิกจ่ายในระบบ</p>
                </div>
            ) : (
                documents.map((document) => (
                    <div
                        key={document.id}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-blue-300"
                        onClick={() => onDocumentClick(document.id)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {document.title}
                                            </h3>
                                            <p className="text-sm text-gray-600">{document.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                                            {getStatusText(document.status)}
                                        </span>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4" />
                                        <span>ไตรมาสที่ {document.quarter}/{document.year}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <DollarSign className="w-4 h-4" />
                                        <span>{formatBudget(document.totalBudget)}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>สร้างเมื่อ: {formatDate(document.createdDate)}</span>
                                        <span>รหัสเบิกจ่าย: PAY-{document.id.toString().padStart(4, '0')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}
