interface ProgressBarProps {
  percentage: number;
}

export default function ProgressBar({ percentage }: ProgressBarProps) {
  return (
    <div className="progress-container">
      <div className="progress-label">
        <span>Overall Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <style>{`
        .progress-container {
          margin: 2rem 0;
          background-color: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-weight: 600;
          color: #1e293b;
        }
        .progress-bar {
          height: 12px;
          background-color: #f1f5f9;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background-color: #2563eb;
          transition: width 0.5s ease-out;
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
}
