'use client';

import { useState } from 'react';
import { FileText, Download, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  src: string;
  title?: string;
  fileType?: string;
  onComplete?: () => void;
}

export default function DocumentViewer({ src, title, fileType, onComplete }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'document';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(src, '_blank');
  };

  const isPDF = fileType === 'application/pdf' || src.toLowerCase().endsWith('.pdf');

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">{title || 'Document'}</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            disabled={zoom <= 50}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            disabled={zoom >= 200}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenInNewTab}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document Content */}
      <div className="bg-gray-100 p-4 min-h-[600px] flex items-center justify-center">
        {isPDF ? (
          <iframe
            src={src}
            className="w-full border-0 rounded"
            style={{ height: '600px', transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            onLoad={() => setLoading(false)}
          />
        ) : (
          <div className="text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Preview not available for this file type
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleDownload} variant="default">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleOpenInNewTab} variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Complete Button */}
      {onComplete && (
        <div className="p-4 border-t border-border bg-muted/50">
          <Button onClick={onComplete} className="w-full">
            Mark as Complete
          </Button>
        </div>
      )}
    </div>
  );
}
