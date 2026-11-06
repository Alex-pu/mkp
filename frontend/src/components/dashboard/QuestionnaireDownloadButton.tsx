import React, { useState } from 'react';
import Button from '../common/Button';
import { pollService } from '../../services/pollService';

interface QuestionnaireDownloadButtonProps {
  pollId: string;
  pollTitle: string;
  size?: 'sm' | 'md' | 'lg';
}

const QuestionnaireDownloadButton: React.FC<QuestionnaireDownloadButtonProps> = ({ pollId, pollTitle, size = 'md' }) => {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      const pdf = await pollService.downloadQuestionnaire(pollId);
      const url = window.URL.createObjectURL(pdf);
      const link = document.createElement('a');
      const safeTitle = pollTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'poll';
      link.href = url;
      link.download = `${safeTitle}-questionnaire.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch {
      setError('PDF download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <Button type="button" variant="secondary" size={size} onClick={handleDownload} disabled={downloading}>
        {downloading ? 'Preparing PDF...' : 'Download questionnaire'}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
};

export default QuestionnaireDownloadButton;
