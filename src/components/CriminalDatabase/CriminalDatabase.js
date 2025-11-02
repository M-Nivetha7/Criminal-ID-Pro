import React from 'react';
import { Edit, Trash2, User, Shield, AlertTriangle, Search, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const CriminalDatabase = ({ criminals, onEdit, onDelete, onAdd, searchTerm, onSearchChange }) => {
  // Filter criminals based on search term
  const filteredCriminals = criminals.filter(criminal =>
    criminal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    criminal.crime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    criminal.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Statistics
  const stats = {
    total: criminals.length,
    highRisk: criminals.filter(c => c.severity === 'High').length,
    wanted: criminals.filter(c => c.status === 'Wanted').length,
    suspected: criminals.filter(c => c.status === 'Suspected').length,
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' };
      case 'Medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
      case 'Low':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Wanted':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      case 'Suspected':
        return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'Monitor':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'Arrested':
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  if (!criminals || criminals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Criminal Database</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>0 records</span>
          </div>
        </div>
        <div className="text-center py-12 text-gray-500">
          <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">No criminal records found</p>
          <p className="text-sm mb-6">Add criminals to build your database</p>
          <button
            onClick={onAdd}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add First Criminal
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Criminal Database</h3>
          <p className="text-gray-600">Manage and search criminal records</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            <span>{stats.total} records</span>
          </div>
          <button
            onClick={onAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Criminal
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search criminals by name, crime, or status..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        {searchTerm && (
          <div className="text-sm text-gray-500 mt-2">
            Showing {filteredCriminals.length} of {criminals.length} records
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-800">Total Records</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
          <div className="text-sm text-red-800">High Risk</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.wanted}</div>
          <div className="text-sm text-orange-800">Wanted</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.suspected}</div>
          <div className="text-sm text-purple-800">Suspected</div>
        </div>
      </div>

      {/* Criminal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCriminals.map((criminal, index) => {
          const severityColors = getSeverityColor(criminal.severity);
          const statusColors = getStatusColor(criminal.status);
          
          return (
            <motion.div
              key={criminal.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              className="bg-white border border-gray-200 rounded-xl p-4 transition-all duration-300 hover:border-indigo-200 group"
            >
              {/* Criminal Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={criminal.image}
                      alt={criminal.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                    />
                    {criminal.severity === 'High' && (
                      <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                        <AlertTriangle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-800 truncate">{criminal.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{criminal.crime}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => onEdit && onEdit(criminal)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                    title="Edit criminal"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(criminal.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete criminal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${severityColors.bg} ${severityColors.text} border ${severityColors.border}`}>
                  {criminal.severity} Risk
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                  {criminal.status}
                </span>
              </div>
              
              {/* Additional Information */}
              <div className="space-y-2 text-xs text-gray-600 mb-3">
                {criminal.lastSeen && (
                  <div className="flex items-center justify-between">
                    <span>Last Seen:</span>
                    <span className="font-medium text-gray-700">{criminal.lastSeen}</span>
                  </div>
                )}
                
                {criminal.age && (
                  <div className="flex items-center justify-between">
                    <span>Age:</span>
                    <span className="font-medium text-gray-700">{criminal.age}</span>
                  </div>
                )}
                
                {criminal.height && (
                  <div className="flex items-center justify-between">
                    <span>Height:</span>
                    <span className="font-medium text-gray-700">{criminal.height}</span>
                  </div>
                )}

                {criminal.description && (
                  <div className="text-gray-600 text-xs line-clamp-2">
                    {criminal.description}
                  </div>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <button 
                    onClick={() => onEdit && onEdit(criminal)}
                    className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-2 rounded-lg transition-colors font-medium text-center"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => console.log('Analyze:', criminal)}
                    className="flex-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 py-1.5 px-2 rounded-lg transition-colors font-medium text-center"
                  >
                    Analyze
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty Search Results */}
      {filteredCriminals.length === 0 && searchTerm && (
        <div className="text-center py-12 text-gray-500">
          <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">No criminals found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      )}

      {/* Footer Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
          <div>
            Showing <span className="font-semibold">{filteredCriminals.length}</span> of{' '}
            <span className="font-semibold">{criminals.length}</span> criminal records
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>High Risk: {stats.highRisk}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span>Wanted: {stats.wanted}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CriminalDatabase;