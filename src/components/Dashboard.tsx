import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Package, CheckCircle, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { apiService, DashboardData } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { toast } from 'sonner@2.0.3';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardProps {
  items: any[]; // Keep for backward compatibility but use API data
}

export function Dashboard({ items }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        // Fallback to local items calculation
        calculateLocalData();
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculateLocalData = () => {
    // Fallback calculation from local items
    const totalItems = items.length;
    const lostItems = items.filter(item => item.type === 'lost').length;
    const foundItems = items.filter(item => item.type === 'found').length;
    const activeItems = items.filter(item => item.status === 'active').length;
    const claimedItems = items.filter(item => item.status === 'claimed').length;
    const pendingItems = items.filter(item => item.status === 'pending').length;
    const claimRate = totalItems > 0 ? ((claimedItems / totalItems) * 100).toFixed(1) : 0;

    const categoryCount: Record<string, number> = {};
    items.forEach(item => {
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
    const topCategories = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    const locationCount: Record<string, number> = {};
    items.forEach(item => {
      locationCount[item.location] = (locationCount[item.location] || 0) + 1;
    });
    const topLocations = Object.entries(locationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    setDashboardData({
      stats: {
        totalItems,
        lostItems,
        foundItems,
        activeItems,
        claimedItems,
        pendingItems,
        claimRate: parseFloat(claimRate),
      },
      topCategories,
      topLocations,
      mostLostItems: [],
      itemsByDate: {},
    });
  };

  if (loading || !dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const { stats, topCategories, topLocations, mostLostItems, itemsByDate } = dashboardData;

  const statsData = [
    {
      title: 'Total Items',
      value: stats.totalItems,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Active Items',
      value: stats.activeItems,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Claimed Items',
      value: stats.claimedItems,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Lost Items',
      value: stats.lostItems,
      icon: TrendingDown,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Found Items',
      value: stats.foundItems,
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Claim Rate',
      value: `${stats.claimRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
  ];

  // Prepare chart data
  const categoriesChartData = {
    labels: topCategories.slice(0, 5).map(c => c.name),
    datasets: [
      {
        label: 'Items by Category',
        data: topCategories.slice(0, 5).map(c => c.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const locationsChartData = {
    labels: topLocations.slice(0, 5).map(l => l.name.length > 15 ? l.name.substring(0, 15) + '...' : l.name),
    datasets: [
      {
        label: 'Items by Location',
        data: topLocations.slice(0, 5).map(l => l.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
    ],
  };

  const statusChartData = {
    labels: ['Active', 'Claimed', 'Pending'],
    datasets: [
      {
        label: 'Items by Status',
        data: [stats.activeItems, stats.claimedItems, stats.pendingItems],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(156, 163, 175, 0.8)',
        ],
      },
    ],
  };

  const itemsByDateData = {
    labels: Object.keys(itemsByDate)
      .map(d => `Day ${d}`)
      .slice(-7),
    datasets: [
      {
        label: 'Items Reported',
        data: Object.values(itemsByDate).slice(-7),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of lost and found items statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsData.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Top Categories</h3>
            {topCategories.length > 0 ? (
              <Bar
                data={categoriesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Items by Status</h3>
            {stats.totalItems > 0 ? (
              <Doughnut
                data={statusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                }}
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Top Locations</h3>
            {topLocations.length > 0 ? (
              <>
                <Bar
                  data={locationsChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    indexAxis: 'y',
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
                <div className="mt-4 space-y-2">
                  {topLocations.slice(0, 5).map((location) => (
                    <div key={location.name} className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 flex items-center justify-between">
                        <span className="line-clamp-1">{location.name}</span>
                        <span className="text-muted-foreground ml-2">{location.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </Card>
        </motion.div>

        {Object.keys(itemsByDate).length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Items Reported (Last 7 Days)</h3>
              <Line
                data={itemsByDateData}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Card>
          </motion.div>
        )}
      </div>

      {mostLostItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Most Frequently Lost Items</h3>
            <div className="space-y-3">
              {mostLostItems.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">#{index + 1}</span>
                    </div>
                    <span>{item.name}</span>
                  </div>
                  <Badge variant="outline">{item.count} times</Badge>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

