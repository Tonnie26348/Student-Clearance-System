import { CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';

interface StatusCardProps {
  department: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

export default function StatusCard({ department, status, comment }: StatusCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="icon-success" size={24} />;
      case 'rejected': return <XCircle className="icon-error" size={24} />;
      default: return <Clock className="icon-pending" size={24} />;
    }
  };

  const getStatusClass = () => `status-card status-${status}`;

  return (
    <div className={getStatusClass()}>
      <div className="card-header">
        <span className="dept-name">{department}</span>
        {getStatusIcon()}
      </div>
      <div className="card-body">
        <span className="status-label">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
        {comment && (
          <div className="comment-box">
            <MessageSquare size={14} />
            <p>{comment}</p>
          </div>
        )}
      </div>
      <style>{`
        .status-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          border-left: 6px solid #cbd5e1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .status-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .status-approved { border-left-color: #22c55e; }
        .status-rejected { border-left-color: #ef4444; }
        .status-pending { border-left-color: #f59e0b; }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .dept-name {
          font-weight: 700;
          font-size: 1.1rem;
          color: #1e293b;
        }
        .status-label {
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          background: #f1f5f9;
        }
        .icon-success { color: #22c55e; }
        .icon-error { color: #ef4444; }
        .icon-pending { color: #f59e0b; }
        
        .comment-box {
          margin-top: 1rem;
          padding: 0.75rem;
          background-color: #f8fafc;
          border-radius: 6px;
          font-size: 0.85rem;
          color: #64748b;
          display: flex;
          gap: 0.5rem;
          align-items: flex-start;
          border: 1px dashed #e2e8f0;
        }
        .comment-box p { margin: 0; font-style: italic; }
      `}</style>
    </div>
  );
}
