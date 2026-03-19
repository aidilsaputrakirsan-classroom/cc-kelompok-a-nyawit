'use client';

import { useState, useEffect } from 'react';
import { LoginPage } from '@/pages/LoginPage';
import { LeftNavigation, PageType } from '@/components/LeftNavigation';
import { MobileNavigation } from '@/components/MobileNavigation';
import { UserProfileDropdown } from '@/components/UserProfileDropdown';
import { GlobalSearch } from '@/components/GlobalSearch';
import { InventoryPage } from '@/pages/InventoryPage';
import { ReportsPage, Report } from '@/pages/ReportsPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LayoutDashboard } from 'lucide-react';
import { AuthService } from '@/lib/auth';

const defaultReports: Report[] = [
  {
    title: 'Asset Utilization Report',
    description: 'Detailed analysis of asset usage and efficiency',
    date: '2025-10-01',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Maintenance Summary',
    description: 'Overview of all maintenance activities this month',
    date: '2025-10-05',
    status: 'Ready',
    color: '#2563EB'
  },
  {
    title: 'Purchase Order Report',
    description: 'Summary of all asset purchases and expenses',
    date: '2025-10-08',
    status: 'Generating',
    color: '#F59E0B'
  },
  {
    title: 'Depreciation Analysis',
    description: 'Asset depreciation and value tracking',
    date: '2025-10-10',
    status: 'Scheduled',
    color: '#6B7280'
  },
  {
    title: 'Hardware Inventory Report',
    description: 'Complete listing of all hardware assets by location',
    date: '2025-09-28',
    status: 'Ready',
    color: '#2563EB'
  },
  {
    title: 'Software License Audit',
    description: 'Compliance report for all software licenses and renewals',
    date: '2025-10-03',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Asset Lifecycle Report',
    description: 'Analysis of asset age and replacement recommendations',
    date: '2025-10-12',
    status: 'Generating',
    color: '#F59E0B'
  },
  {
    title: 'Department Asset Allocation',
    description: 'Breakdown of assets assigned to each department',
    date: '2025-10-02',
    status: 'Ready',
    color: '#8B5CF6'
  },
  {
    title: 'Lost & Stolen Assets',
    description: 'Report of missing assets and security incidents',
    date: '2025-09-30',
    status: 'Ready',
    color: '#EF4444'
  },
  {
    title: 'Warranty Expiration Report',
    description: 'Assets with warranties expiring in the next 90 days',
    date: '2025-10-06',
    status: 'Ready',
    color: '#F59E0B'
  },
  {
    title: 'Asset Compliance Report',
    description: 'Regulatory compliance status for all assets',
    date: '2025-10-11',
    status: 'Scheduled',
    color: '#6B7280'
  },
  {
    title: 'Quarterly Cost Analysis',
    description: 'Total cost of ownership and operational expenses',
    date: '2025-10-07',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Remote Asset Tracking',
    description: 'Status and location of all remote employee assets',
    date: '2025-10-04',
    status: 'Ready',
    color: '#2563EB'
  },
  {
    title: 'Asset Transfer History',
    description: 'Record of all asset transfers and reassignments',
    date: '2025-09-29',
    status: 'Ready',
    color: '#8B5CF6'
  },
  {
    title: 'IT Equipment Inventory',
    description: 'Comprehensive list of all IT equipment and peripherals',
    date: '2025-10-09',
    status: 'Ready',
    color: '#2563EB'
  },
  {
    title: 'Monthly Disposal Report',
    description: 'Assets disposed or recycled this month',
    date: '2025-10-13',
    status: 'Generating',
    color: '#F59E0B'
  },
  {
    title: 'Asset Condition Assessment',
    description: 'Detailed condition ratings for all tracked assets',
    date: '2025-10-11',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Insurance Coverage Report',
    description: 'Insurance status and coverage gaps for assets',
    date: '2025-10-15',
    status: 'Scheduled',
    color: '#6B7280'
  },
  {
    title: 'Vendor Performance Analysis',
    description: 'Evaluation of asset suppliers and service providers',
    date: '2025-10-14',
    status: 'Generating',
    color: '#F59E0B'
  },
  {
    title: 'Energy Consumption Report',
    description: 'Power usage and efficiency metrics for equipment',
    date: '2025-10-05',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Asset Tagging Audit',
    description: 'Verification of asset tags and identification labels',
    date: '2025-10-16',
    status: 'Scheduled',
    color: '#6B7280'
  },
  {
    title: 'Mobile Device Management',
    description: 'Status report for all mobile devices and tablets',
    date: '2025-10-02',
    status: 'Ready',
    color: '#8B5CF6'
  },
  {
    title: 'Contract Renewal Report',
    description: 'Upcoming contract renewals and expirations',
    date: '2025-10-17',
    status: 'Scheduled',
    color: '#6B7280'
  },
  {
    title: 'End-of-Life Assets',
    description: 'Assets reaching end of useful life requiring replacement',
    date: '2025-10-08',
    status: 'Ready',
    color: '#EF4444'
  },
  {
    title: 'Security Incident Report',
    description: 'Asset-related security breaches and incidents',
    date: '2025-10-01',
    status: 'Ready',
    color: '#EF4444'
  },
  {
    title: 'Budget vs Actual Analysis',
    description: 'Comparison of planned and actual asset expenditures',
    date: '2025-10-12',
    status: 'Generating',
    color: '#F59E0B'
  },
  {
    title: 'Asset Upgrade Report',
    description: 'Scheduled upgrades and enhancement projects',
    date: '2025-10-18',
    status: 'Scheduled',
    color: '#6B7280'
  },
  {
    title: 'User Assignment Report',
    description: 'Assets assigned to users across all departments',
    date: '2025-10-03',
    status: 'Ready',
    color: '#8B5CF6'
  },
  {
    title: 'Backup System Status',
    description: 'Health and status of all backup systems and storage',
    date: '2025-10-06',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Server Infrastructure Report',
    description: 'Complete inventory of all server assets and configurations',
    date: '2025-10-07',
    status: 'Ready',
    color: '#2563EB'
  },
  {
    title: 'Network Equipment Status',
    description: 'Status report for routers, switches, and network devices',
    date: '2025-10-09',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Printer and Scanner Audit',
    description: 'Inventory of all printing and scanning equipment',
    date: '2025-10-04',
    status: 'Ready',
    color: '#8B5CF6'
  },
  {
    title: 'Storage Capacity Report',
    description: 'Available and utilized storage across all systems',
    date: '2025-10-08',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Peripheral Equipment Report',
    description: 'Monitors, keyboards, mice, and other peripherals',
    date: '2025-10-02',
    status: 'Ready',
    color: '#2563EB'
  },
  {
    title: 'Video Conferencing Assets',
    description: 'Cameras, microphones, and conferencing equipment',
    date: '2025-10-05',
    status: 'Ready',
    color: '#8B5CF6'
  },
  {
    title: 'Office Furniture Inventory',
    description: 'Desks, chairs, and other office furniture assets',
    date: '2025-10-01',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Audio Visual Equipment',
    description: 'Projectors, displays, and AV equipment status',
    date: '2025-10-06',
    status: 'Ready',
    color: '#2563EB'
  },
  {
    title: 'Test Equipment Inventory',
    description: 'Specialized testing and measurement devices',
    date: '2025-10-03',
    status: 'Ready',
    color: '#8B5CF6'
  },
  {
    title: 'Environmental Sensors Report',
    description: 'Temperature, humidity, and environmental monitoring devices',
    date: '2025-10-07',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Access Control Systems',
    description: 'Badge readers, locks, and security access equipment',
    date: '2025-10-04',
    status: 'Ready',
    color: '#EF4444'
  },
  {
    title: 'Power Supply Equipment',
    description: 'UPS systems and power distribution units',
    date: '2025-10-09',
    status: 'Ready',
    color: '#10B981'
  },
  {
    title: 'Vehicle Fleet Report',
    description: 'Company vehicles and transportation assets',
    date: '2025-10-05',
    status: 'Ready',
    color: '#2563EB'
  },
  {
    title: 'Lab Equipment Inventory',
    description: 'Scientific and research laboratory equipment',
    date: '2025-10-02',
    status: 'Ready',
    color: '#8B5CF6'
  },
  {
    title: 'Kitchen Appliances Report',
    description: 'Break room and kitchen equipment inventory',
    date: '2025-10-08',
    status: 'Ready',
    color: '#10B981'
  }
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>('inventory');
  const [reports, setReports] = useState<Report[]>([]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const isAuthenticated = AuthService.isAuthenticated();
    if (isAuthenticated) {
      setIsLoggedIn(true);
    }
  }, []);

  // Load saved reports
  useEffect(() => {
    const savedReports = localStorage.getItem('asset-reports');
    if (savedReports) {
      try {
        setReports(JSON.parse(savedReports));
      } catch (error) {
        console.error('Failed to parse saved reports:', error);
        setReports(defaultReports);
      }
    } else {
      setReports(defaultReports);
    }
  }, []);

  useEffect(() => {
    if (reports.length > 0) {
      localStorage.setItem('asset-reports', JSON.stringify(reports));
    }
  }, [reports]);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setCurrentPage('inventory');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'inventory':
        return <InventoryPage />;
      case 'reports':
        return <ReportsPage reports={reports} setReports={setReports} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <InventoryPage />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFB' }}>
      <LeftNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <div className="md:ml-52">
        <header className="border-b bg-white fixed top-0 right-0 md:left-52 left-0 z-50" style={{ height: '73px' }}>
          <div className="px-3 md:px-6 h-full flex items-center justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
              <MobileNavigation currentPage={currentPage} onPageChange={setCurrentPage} />
              
              <div className="md:hidden flex items-center gap-2">
                <div className="p-1.5 rounded-lg flex-shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                  <LayoutDashboard className="h-4 w-4" style={{ color: '#2563EB' }} />
                </div>
                <h1 className="text-sm font-bold whitespace-nowrap" style={{ color: '#111827' }}>Asset Manager</h1>
              </div>

              <div className="hidden md:block flex-1 min-w-0">
                <GlobalSearch />
              </div>
            </div>
            
            <UserProfileDropdown onLogout={handleLogout} />
          </div>
        </header>

        <main className="p-3 md:p-6" style={{ paddingTop: '85px' }}>
          <div className="md:hidden mb-4">
            <GlobalSearch />
          </div>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;

