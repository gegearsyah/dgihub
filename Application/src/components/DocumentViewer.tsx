'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, Download, ExternalLink, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface DocumentViewerProps {
  src: string;
  title?: string;
  fileType?: string;
  materialId?: string;
  onComplete?: () => void;
}

export default function DocumentViewer({ 
  src, 
  title, 
  fileType,
  materialId,
  onComplete 
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { success } = useToast();
  const [savedProgress, setSavedProgress] = useState<number | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const lastSaveTimeRef = useRef<number>(0);

  const isPDF = fileType === 'application/pdf' || src.toLowerCase().endsWith('.pdf');

  // Load saved progress
  useEffect(() => {
    if (materialId) {
      loadProgress();
    } else {
      setLoadingProgress(false);
    }
  }, [materialId]);

  const loadProgress = async () => {
    try {
      const response = await apiClient.getMaterialProgress(materialId!);
      if (response.success && response.data) {
        const progressData = response.data as any;
        if (progressData.last_position && progressData.last_position > 0) {
          setSavedProgress(progressData.last_position);
          setCurrentPage(progressData.last_position);
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Save progress periodically
  const saveProgress = async (page: number) => {
    if (!materialId) return;
    
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 5000) return; // Save every 5 seconds
    
    lastSaveTimeRef.current = now;
    const progressPercentage = totalPages > 0 ? (page / totalPages) * 100 : 0;

    try {
      await apiClient.updateMaterialProgress(materialId, {
        progressPercentage,
        lastPosition: page,
        markComplete: progressPercentage >= 95
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  // Try to get total pages from PDF (this is approximate)
  useEffect(() => {
    if (isPDF && iframeRef.current) {
      // PDF.js or similar could be used here for accurate page count
      // For now, we'll estimate based on document size
      const iframe = iframeRef.current;
      iframe.onload = () => {
        setLoading(false);
        // Try to extract page count from PDF (this is a placeholder)
        // In production, you'd use PDF.js to get accurate page count
        setTotalPages(10); // Default estimate
      };
    } else {
      setLoading(false);
    }
  }, [isPDF]);

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

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    if (materialId) {
      saveProgress(newPage);
    }
    // Scroll PDF to page (if using PDF.js)
    if (iframeRef.current && isPDF) {
      // This would work with PDF.js viewer
      // For now, we'll just update the URL with page parameter
      const iframe = iframeRef.current;
      iframe.src = `${src}#page=${newPage}`;
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    if (iframeRef.current && isPDF) {
      // PDF search functionality would go here
      // For now, we'll just open in new tab with search
      window.open(`${src}#search=${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

  const handleMarkComplete = async () => {
    if (materialId) {
      try {
        await apiClient.markMaterialComplete(materialId, {
          progressPercentage: 100,
          lastPosition: currentPage
        });
        success('Document marked as complete!');
      } catch (error) {
        console.error('Failed to mark complete:', error);
      }
    }
    onComplete?.();
  };

  if (loadingProgress) {
    return (
      <div className="w-full bg-card border border-border rounded-lg overflow-hidden min-h-[600px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-5 h-5 text-[#0EB0F9] shrink-0" />
          <h3 className="font-semibold text-foreground truncate">{title || 'Document'}</h3>
          {isPDF && totalPages > 1 && (
            <div className="flex items-center gap-2 ml-4 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="min-w-[80px] text-center">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isPDF && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(!showSearch)}
                className="text-muted-foreground"
              >
                <Search className="w-4 h-4" />
              </Button>
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
            </>
          )}
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleOpenInNewTab}>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && isPDF && (
        <div className="p-2 border-b border-border bg-muted/30 flex gap-2">
          <Input
            type="text"
            placeholder="Search in document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} size="sm">
            Search
          </Button>
        </div>
      )}

      {/* Document Content */}
      <div className="bg-gray-100 p-4 min-h-[600px] flex items-center justify-center overflow-auto">
        {isPDF ? (
          <iframe
            ref={iframeRef}
            src={`${src}${savedProgress ? `#page=${savedProgress}` : ''}`}
            className="w-full border-0 rounded"
            style={{ 
              height: '600px', 
              transform: `scale(${zoom / 100})`, 
              transformOrigin: 'top left',
              width: `${100 / (zoom / 100)}%`
            }}
            onLoad={() => {
              setLoading(false);
              if (savedProgress && savedProgress > 1) {
                success(`Resumed from page ${savedProgress}`);
              }
            }}
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

      {/* Progress Indicator */}
      {materialId && totalPages > 1 && (
        <div className="px-4 py-2 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-[#0EB0F9] h-1.5 rounded-full transition-all"
                style={{ width: `${(currentPage / totalPages) * 100}%` }}
              />
            </div>
            <span>{Math.round((currentPage / totalPages) * 100)}%</span>
          </div>
        </div>
      )}

      {/* Complete Button */}
      {onComplete && (
        <div className="p-4 border-t border-border bg-muted/50">
          <Button onClick={handleMarkComplete} className="w-full bg-[#0EB0F9] hover:bg-[#0A9DE6]">
            Mark as Complete
          </Button>
        </div>
      )}
    </div>
  );
}
