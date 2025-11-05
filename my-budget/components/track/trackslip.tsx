import { FileText, DollarSign } from 'lucide-react';

interface Document {
  id: number;
  title: string;
  totalBudget: number;
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

  return (
    <div className="space-y-3">
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
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:border-blue-300 cursor-pointer transition-all"
            onClick={() => onDocumentClick(document.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-gray-800 font-medium">{document.title}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DollarSign className="w-4 h-4" />
                <span>{formatBudget(document.totalBudget)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
