'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';

interface Article {
  status: string;
  created_at: string;
  views: number;
  likes: number;
}

export default function DashboardCharts({ articles }: { articles: Article[] }) {
  // Ensure articles is always an array
  const safeArticles = Array.isArray(articles) ? articles : [];
  
  // Process data for charts
  const statusData = [
    { name: 'Published', value: safeArticles.filter(a => a.status === 'published').length, color: '#10b981' },
    { name: 'Draft', value: safeArticles.filter(a => a.status === 'draft').length, color: '#6b7280' },
    { name: 'Scheduled', value: safeArticles.filter(a => a.status === 'scheduled').length, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Get last 7 days of article creation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const articlesPerDay = last7Days.map(date => {
    const count = safeArticles.filter(a => 
      a.created_at && a.created_at.startsWith(date)
    ).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      articles: count,
    };
  });

  // Top performing articles
  const topArticles = [...safeArticles]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5)
    .map(a => ({
      name: a.status,
      views: a.views || 0,
      likes: a.likes || 0,
    }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Articles by Status - Pie Chart */}
      <div className="border-2 border-black bg-white p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center mb-6">
          <PieChartIcon size={24} className="mr-2" />
          <h2 className="text-xl font-serif font-bold">Articles by Status</h2>
        </div>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#000" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Articles Created - Line Chart */}
      <div className="border-2 border-black bg-white p-6 hover:shadow-xl transition-shadow lg:col-span-2">
        <div className="flex items-center mb-6">
          <TrendingUp size={24} className="mr-2" />
          <h2 className="text-xl font-serif font-bold">Articles Created (Last 7 Days)</h2>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={articlesPerDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#000"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#000"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                border: '2px solid #000', 
                borderRadius: '0',
                backgroundColor: '#fff'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="articles" 
              stroke="#000" 
              strokeWidth={3}
              dot={{ fill: '#000', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Engagement Metrics - Bar Chart */}
      <div className="border-2 border-black bg-white p-6 hover:shadow-xl transition-shadow lg:col-span-3">
        <div className="flex items-center mb-6">
          <BarChart3 size={24} className="mr-2" />
          <h2 className="text-xl font-serif font-bold">Top Articles Performance</h2>
        </div>
        {topArticles.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topArticles}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#000"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#000"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  border: '2px solid #000', 
                  borderRadius: '0',
                  backgroundColor: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="views" fill="#000" name="Views" />
              <Bar dataKey="likes" fill="#6b7280" name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No published articles yet
          </div>
        )}
      </div>
    </div>
  );
}