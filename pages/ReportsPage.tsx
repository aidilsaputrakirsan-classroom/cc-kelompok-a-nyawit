import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Eye } from 'lucide-react';
import { CreateReportDialog, type ReportData } from '@/components/CreateReportDialog';
import { ReportPreviewDialog } from '@/components/ReportPreviewDialog';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export interface Report {
  title: string;
  description: string;
  date: string;
  status: string;
  color: string;
}

interface ReportsPageProps {
  reports: Report[];
  setReports: (reports: Report[]) => void;
}

export function ReportsPage({ reports, setReports }: ReportsPageProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const { toast } = useToast();

  const handleCreateReport = () => {
    setDialogOpen(true);
  };

  const handleDownloadReport = (reportTitle: string) => {
    toast({
      title: 'Downloading report',
      description: `${reportTitle} is being downloaded.`,
    });
  };

  const handlePreviewReport = (reportTitle: string) => {
    setSelectedReport(reportTitle);
    setPreviewDialogOpen(true);
  };

  const onCreateReport = (reportData: ReportData) => {
    const newReport: Report = {
      title: reportData.title,
      description: reportData.description,
      date: reportData.date,
      status: reportData.status,
      color: reportData.color
    };

    setReports([newReport, ...reports]);
    
    toast({
      title: 'Report created successfully',
      description: `${reportData.title} is now being generated.`,
    });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#111827' }}>Reports</h1>
            <p className="text-xs md:text-sm mt-1" style={{ color: '#6B7280' }}>
              Generate and download various asset reports
            </p>
          </div>
          <Button onClick={handleCreateReport} className="w-full sm:w-auto" style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>
            <FileText className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {[
            { label: 'Total Reports', value: String(reports.length), icon: FileText, color: '#2563EB', bgColor: '#EFF6FF' },
            { label: 'This Month', value: String(reports.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length), icon: Calendar, color: '#10B981', bgColor: '#ECFDF5' },
            { label: 'Downloads', value: '156', icon: Download, color: '#F59E0B', bgColor: '#FEF3C7' }
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{stat.label}</p>
                      <h3 className="text-2xl font-bold mt-2" style={{ color: '#111827' }}>{stat.value}</h3>
                    </div>
                    <div className="p-3 rounded-full" style={{ backgroundColor: stat.bgColor }}>
                      <Icon className="h-5 w-5" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          {reports.map((report) => (
            <Card key={report.title} className="cursor-pointer transition-all hover:shadow-md h-full flex flex-col">
              <CardHeader className="flex-none">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg flex-shrink-0" style={{ backgroundColor: `${report.color}15` }}>
                      <FileText className="h-5 w-5" style={{ color: report.color }} />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base" style={{ color: '#111827' }}>
                        {report.title}
                      </CardTitle>
                      <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
                        {report.description}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex items-end">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}>
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{report.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
                      style={{ 
                        backgroundColor: `${report.color}15`,
                        color: report.color
                      }}
                    >
                      {report.status}
                    </span>
                    {report.status === 'Ready' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePreviewReport(report.title)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadReport(report.title)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <CreateReportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateReport={onCreateReport}
      />
      <ReportPreviewDialog
        open={previewDialogOpen}
        onOpenChange={setPreviewDialogOpen}
        reportTitle={selectedReport}
      />
      <Toaster />
    </>
  );
}

