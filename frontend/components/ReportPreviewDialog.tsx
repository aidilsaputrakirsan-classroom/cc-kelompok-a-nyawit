import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
}

const mockReportData: Record<string, any> = {
  'Asset Utilization Report': {
    summary: [
      { label: 'Total Assets', value: '245', trend: 'up', change: '+12%' },
      { label: 'In Use', value: '198', trend: 'up', change: '+8%' },
      { label: 'Utilization Rate', value: '80.8%', trend: 'up', change: '+3.2%' }
    ],
    tableData: [
      { category: 'Hardware', total: 145, inUse: 120, rate: '82.8%' },
      { category: 'Software', total: 68, inUse: 54, rate: '79.4%' },
      { category: 'Peripherals', total: 32, inUse: 24, rate: '75.0%' }
    ]
  },
  'Maintenance Summary': {
    summary: [
      { label: 'Total Maintenance', value: '42', trend: 'down', change: '-5%' },
      { label: 'Completed', value: '38', trend: 'up', change: '+10%' },
      { label: 'Average Time', value: '2.3 days', trend: 'down', change: '-0.5' }
    ],
    tableData: [
      { type: 'Preventive', count: 18, completed: 18, avgDays: '1.2' },
      { type: 'Corrective', count: 15, completed: 13, avgDays: '3.1' },
      { type: 'Emergency', count: 9, completed: 7, avgDays: '2.8' }
    ]
  }
};

export function ReportPreviewDialog({ open, onOpenChange, reportTitle }: ReportPreviewDialogProps) {
  const reportData = mockReportData[reportTitle] || {
    summary: [
      { label: 'Total Items', value: '150', trend: 'up', change: '+5%' },
      { label: 'Active', value: '132', trend: 'up', change: '+8%' },
      { label: 'Success Rate', value: '88%', trend: 'up', change: '+2%' }
    ],
    tableData: [
      { category: 'Category A', total: 75, active: 68, rate: '90.7%' },
      { category: 'Category B', total: 45, active: 38, rate: '84.4%' },
      { category: 'Category C', total: 30, active: 26, rate: '86.7%' }
    ]
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reportTitle} - Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportData.summary.map((item: any) => (
              <Card key={item.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#6B7280' }}>{item.label}</p>
                      <h3 className="text-2xl font-bold mt-2" style={{ color: '#111827' }}>{item.value}</h3>
                      <div className="flex items-center gap-1 mt-2">
                        {item.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4" style={{ color: '#10B981' }} />
                        ) : (
                          <TrendingDown className="h-4 w-4" style={{ color: '#EF4444' }} />
                        )}
                        <span 
                          className="text-sm font-medium"
                          style={{ color: item.trend === 'up' ? '#10B981' : '#EF4444' }}
                        >
                          {item.change}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-full" style={{ backgroundColor: '#EFF6FF' }}>
                      <Activity className="h-5 w-5" style={{ color: '#2563EB' }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(reportData.tableData[0] || {}).map((key) => (
                      <TableHead key={key} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.tableData.map((row: any, index: number) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value: any, cellIndex: number) => (
                        <TableCell key={cellIndex}>{value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
