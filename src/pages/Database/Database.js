import React, { useState } from 'react';
import { useCriminal } from '../../context/CriminalContext';
import CriminalDatabase from '../../components/CriminalDatabase/CriminalDatabase';
import { motion, AnimatePresence } from 'framer-motion';

const Database = () => {
  const { criminals, addCriminal, updateCriminal, deleteCriminal } = useCriminal();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCriminal, setEditingCriminal] = useState(null);
  const [newCriminal, setNewCriminal] = useState({
    name: '',
    crime: '',
    severity: 'Medium',
    status: 'Wanted',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    lastSeen: '',
    age: '',
    height: '',
    description: ''
  });

  const handleAddCriminal = (e) => {
    e.preventDefault();
    if (newCriminal.name && newCriminal.crime) {
      addCriminal(newCriminal);
      setNewCriminal({
        name: '',
        crime: '',
        severity: 'Medium',
        status: 'Wanted',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        lastSeen: '',
        age: '',
        height: '',
        description: ''
      });
      setShowAddForm(false);
    }
  };

  const handleEditCriminal = (criminal) => {
    setEditingCriminal(criminal);
    setNewCriminal(criminal);
    setShowAddForm(true);
  };

  const handleUpdateCriminal = (e) => {
    e.preventDefault();
    if (editingCriminal && newCriminal.name && newCriminal.crime) {
      updateCriminal(editingCriminal.id, newCriminal);
      setEditingCriminal(null);
      setShowAddForm(false);
      setNewCriminal({
        name: '',
        crime: '',
        severity: 'Medium',
        status: 'Wanted',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        lastSeen: '',
        age: '',
        height: '',
        description: ''
      });
    }
  };

  const handleDeleteCriminal = (id) => {
    if (window.confirm('Are you sure you want to delete this criminal record?')) {
      deleteCriminal(id);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <CriminalDatabase
          criminals={criminals}
          onEdit={handleEditCriminal}
          onDelete={handleDeleteCriminal}
          onAdd={() => {
            setEditingCriminal(null);
            setShowAddForm(true);
            setNewCriminal({
              name: '',
              crime: '',
              severity: 'Medium',
              status: 'Wanted',
              image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
              lastSeen: '',
              age: '',
              height: '',
              description: ''
            });
          }}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Add/Edit Criminal Modal */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowAddForm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  {editingCriminal ? 'Edit Criminal' : 'Add New Criminal'}
                </h3>
                <form onSubmit={editingCriminal ? handleUpdateCriminal : handleAddCriminal} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      value={newCriminal.name}
                      onChange={(e) => setNewCriminal({...newCriminal, name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Crime *</label>
                    <input
                      type="text"
                      value={newCriminal.crime}
                      onChange={(e) => setNewCriminal({...newCriminal, crime: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Risk Severity</label>
                      <select
                        value={newCriminal.severity}
                        onChange={(e) => setNewCriminal({...newCriminal, severity: e.target.value})}
                        className="form-input"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        value={newCriminal.status}
                        onChange={(e) => setNewCriminal({...newCriminal, status: e.target.value})}
                        className="form-input"
                      >
                        <option value="Wanted">Wanted</option>
                        <option value="Suspected">Suspected</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Arrested">Arrested</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Age</label>
                      <input
                        type="text"
                        value={newCriminal.age}
                        onChange={(e) => setNewCriminal({...newCriminal, age: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Height</label>
                      <input
                        type="text"
                        value={newCriminal.height}
                        onChange={(e) => setNewCriminal({...newCriminal, height: e.target.value})}
                        className="form-input"
                        placeholder="5'10"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Seen</label>
                    <input
                      type="text"
                      value={newCriminal.lastSeen}
                      onChange={(e) => setNewCriminal({...newCriminal, lastSeen: e.target.value})}
                      className="form-input"
                      placeholder="2024-01-15"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={newCriminal.description}
                      onChange={(e) => setNewCriminal({...newCriminal, description: e.target.value})}
                      className="form-input"
                      rows="3"
                      placeholder="Additional details about the criminal..."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium"
                    >
                      {editingCriminal ? 'Update' : 'Add'} Criminal
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Database;