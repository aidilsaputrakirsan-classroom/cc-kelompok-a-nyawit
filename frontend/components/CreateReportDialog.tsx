import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateReport: (report: ReportData) => void;
}

export interface ReportData {
  id: string;
  title: string;
  type: string;
  description: string;
  dateFrom: string;
  dateTo: string;
  format: string;
  status: string;
  date: string;
  color: string;
}

const reportTypes = [
  'Asset Utilization Report',
  'Maintenance Summary',
  'Purchase Order Report',
  'Depreciation Analysis',
  'Asset Inventory Report',
  'Cost Analysis Report',
  'Warranty Status Report'
];

const reportFormats = ['PDF', 'Excel', 'CSV'];

const statusColors: Record<string, string> = {
  'Asset Utilization Report': '#10B981',
  'Maintenance Summary': '#2563EB',
  'Purchase Order Report': '#F59E0B',
  'Depreciation Analysis': '#6B7280',
  'Asset Inventory Report': '#8B5CF6',
  'Cost Analysis Report': '#EC4899',
  'Warranty Status Report': '#14B8A6'
};

const reportDescriptions: Record<string, string> = {
  'Asset Utilization Report': 'Detailed analysis of asset usage and efficiency',
  'Maintenance Summary': 'Overview of all maintenance activities this month',
  'Purchase Order Report': 'Summary of all asset purchases and expenses',
  'Depreciation Analysis': 'Asset depreciation and value tracking',
  'Asset Inventory Report': 'Complete inventory listing and status overview',
  'Cost Analysis Report': 'Financial breakdown of asset-related expenditures',
  'Warranty Status Report': 'Warranty coverage and expiration tracking'
};

export function CreateReportDialog({ open, onOpenChange, onCreateReport }: CreateReportDialogProps) {
  const [formData, setFormData] = useState({
    type: reportTypes[0],
    dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    format: 'PDF'
  });

  useEffect(() => {
    if (open) {
      setFormData({
        type: reportTypes[0],
        dateFrom: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        dateTo: new Date().toISOString().split('T')[0],
        format: 'PDF'
      });
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const reportData: ReportData = {
      id: `RPT-${Date.now()}`,
      title: formData.type,
      type: formData.type,
      description: reportDescriptions[formData.type] || 'Custom report analysis',
      dateFrom: formData.dateFrom,
      dateTo: formData.dateTo,
      format: formData.format,
      status: 'Generating',
      date: new Date().toISOString().split('T')[0],
      color: statusColors[formData.type] || '#6B7280'
    };
    
    onCreateReport(reportData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Report Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={formData.dateFrom}
                  onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={formData.dateTo}
                  onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportFormats.map((format) => (
                    <SelectItem key={format} value={format}>{format}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
              Generate Report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
