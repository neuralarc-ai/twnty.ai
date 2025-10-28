'use client';

import { useState, useEffect } from 'react';
import { FileText, Eye, Heart, MessageCircle } from 'lucide-react';
import { StatCardSkeleton } from './LoadingSkeleton';

interface Stats {
  totalArticles: number;
  totalVisitors: number;
  totalLikes: number;
  totalComments: number;
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalArticles: 0,
    totalVisitors: 0,
    totalLikes: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      title: 'Total Articles', 
      value: stats.totalArticles, 
      icon: FileText, 
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-blue-600'
    },
    { 
      title: 'Total Visitors', 
      value: stats.totalVisitors, 
      icon: Eye, 
      color: 'bg-green-50 border-green-200',
      iconColor: 'text-green-600'
    },
    { 
      title: 'Total Likes', 
      value: stats.totalLikes, 
      icon: Heart, 
      color: 'bg-red-50 border-red-200',
      iconColor: 'text-red-600'
    },
    { 
      title: 'Total Comments', 
      value: stats.totalComments, 
      icon: MessageCircle, 
      color: 'bg-purple-50 border-purple-200',
      iconColor: 'text-purple-600'
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`${stat.color} border-2 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <div className={`p-2 rounded-lg bg-white border border-gray-200`}>
                <Icon className={stat.iconColor} size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
          </div>
        );
      })}
    </div>
  );
}