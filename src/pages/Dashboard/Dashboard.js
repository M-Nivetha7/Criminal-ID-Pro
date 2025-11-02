import React from 'react';
import { Link } from 'react-router-dom';
import { useCriminal } from '../../context/CriminalContext';
import { Search, Users, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { criminals, analysisResults } = useCriminal();

  const stats = [
    {
      title: 'Total Criminals',
      value: criminals.length,
      icon: Users,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'High Risk',
      value: criminals.filter(c => c.severity === 'High').length,
      icon: AlertTriangle,
      color: 'red',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      title: 'Identified Matches',
      value: analysisResults ? '1' : '0',
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Analysis Completed',
      value: '15',
      icon: BarChart3,
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            Advanced Criminal Identification
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            AI-powered face recognition system for law enforcement. 
            Upload images and videos to identify persons of interest in real-time.
          </p>
          <Link to="/analyze">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-indigo-600 px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl flex items-center gap-3 mx-auto"
            >
              <Search className="h-6 w-6" />
              Start Analysis
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                whileHover={{ scale: 1.05 }}
                className={`bg-gradient-to-r ${stat.gradient} p-6 rounded-2xl shadow-2xl text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold">{stat.value}</p>
                    <p className="text-white/80">{stat.title}</p>
                  </div>
                  <Icon className="h-12 w-12 text-white/80" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Recent Criminals */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Additions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {criminals.slice(0, 3).map((criminal) => (
              <motion.div
                key={criminal.id}
                whileHover={{ scale: 1.02 }}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={criminal.image}
                    alt={criminal.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{criminal.name}</h3>
                    <p className="text-sm text-gray-600">{criminal.crime}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      criminal.severity === 'High' 
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {criminal.severity} Risk
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;