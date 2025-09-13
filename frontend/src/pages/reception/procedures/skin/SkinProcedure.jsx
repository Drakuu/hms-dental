import React, { useState } from 'react';

const SkinProcedure = () => {
  // Sample initial procedures data
  const initialProcedures = [
    { id: 1, name: 'Chemical Peel', category: 'Cosmetic', duration: 60, cost: 250, description: 'Exfoliating treatment to improve skin texture' },
    { id: 2, name: 'Skin Biopsy', category: 'Diagnostic', duration: 30, cost: 300, description: 'Removal of skin sample for laboratory analysis' },
    { id: 3, name: 'Laser Hair Removal', category: 'Cosmetic', duration: 90, cost: 450, description: 'Permanent reduction of unwanted hair' },
    { id: 4, name: 'Mohs Surgery', category: 'Surgical', duration: 180, cost: 2200, description: 'Precise skin cancer removal technique' },
    { id: 5, name: 'Acne Treatment', category: 'Therapeutic', duration: 45, cost: 180, description: 'Comprehensive acne management program' },
    { id: 6, name: 'Botox Injection', category: 'Cosmetic', duration: 30, cost: 400, description: 'Reduction of facial wrinkles' },
    { id: 7, name: 'Psoriasis Treatment', category: 'Therapeutic', duration: 60, cost: 320, description: 'Management of chronic psoriasis' },
    { id: 8, name: 'Skin Cancer Screening', category: 'Preventive', duration: 30, cost: 150, description: 'Full-body examination for skin cancer detection' },
  ];

  const [procedures, setProcedures] = useState(initialProcedures);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: '',
    cost: '',
    description: ''
  });

  // Categories for filtering
  const categories = ['All', 'Cosmetic', 'Diagnostic', 'Surgical', 'Therapeutic', 'Preventive', 'Reconstructive'];

  // Filter procedures based on search term and category
  const filteredProcedures = procedures.filter(procedure => {
    const matchesSearch = procedure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      procedure.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || procedure.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission for adding/editing procedures
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingProcedure) {
      // Update existing procedure
      setProcedures(procedures.map(p =>
        p.id === editingProcedure.id ? { ...formData, id: editingProcedure.id } : p
      ));
    } else {
      // Add new procedure
      const newProcedure = {
        ...formData,
        id: procedures.length > 0 ? Math.max(...procedures.map(p => p.id)) + 1 : 1
      };
      setProcedures([...procedures, newProcedure]);
    }

    // Reset form and close modal
    setFormData({ name: '', category: '', duration: '', cost: '', description: '' });
    setEditingProcedure(null);
    setShowModal(false);
  };

  // Handle editing a procedure
  const handleEdit = (procedure) => {
    setEditingProcedure(procedure);
    setFormData({
      name: procedure.name,
      category: procedure.category,
      duration: procedure.duration,
      cost: procedure.cost,
      description: procedure.description
    });
    setShowModal(true);
  };

  // Handle deleting a procedure
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this procedure?')) {
      setProcedures(procedures.filter(procedure => procedure.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary-800">Dermatology Procedures Management</h1>
          <p className="text-primary-600 mt-2">Manage all dermatological procedures and treatments</p>
          <div className="mt-4 w-16 h-1 bg-gradient-to-r from-primary-400 to-pink-400 mx-auto rounded-full"></div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-primary-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search skin procedures..."
                  className="block w-full pl-10 pr-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select
                  className="appearance-none w-full px-4 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white pr-8"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-primary-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Add New Procedure
              </button>
            </div>
          </div>
        </div>

        {/* Procedures List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-primary-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-primary-200">
              <thead className="bg-primary-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">
                    Procedure Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-primary-100">
                {filteredProcedures.length > 0 ? (
                  filteredProcedures.map((procedure) => (
                    <tr key={procedure.id} className="hover:bg-primary-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-900">{procedure.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                          {procedure.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-700">
                        {procedure.duration} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-800">
                        ${procedure.cost.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-primary-600 max-w-xs">
                        {procedure.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(procedure)}
                          className="text-primary-600 hover:text-primary-900 mr-4 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(procedure.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-16 h-16 text-primary-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-lg text-primary-500 font-medium">No procedures found</p>
                        <p className="text-primary-400">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-primary-100 text-primary-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Procedures</p>
                <p className="text-2xl font-bold text-primary-800">{procedures.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-pink-100 text-pink-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Cost</p>
                <p className="text-2xl font-bold text-pink-800">
                  ${(procedures.reduce((sum, proc) => sum + parseInt(proc.cost), 0) / procedures.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-100">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Duration</p>
                <p className="text-2xl font-bold text-amber-800">
                  {(procedures.reduce((sum, proc) => sum + parseInt(proc.duration), 0) / procedures.length).toFixed(0)} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Procedures */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-primary-100">
          <h2 className="text-xl font-semibold text-primary-800 mb-4">Popular Skin Procedures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {procedures.slice(0, 4).map(procedure => (
              <div key={procedure.id} className="bg-primary-50 rounded-lg p-4 border border-primary-200 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-primary-800">{procedure.name}</h3>
                <p className="text-sm text-primary-600 mt-1">{procedure.category}</p>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                    {procedure.duration} min
                  </span>
                  <span className="font-medium text-primary-800">${procedure.cost}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-primary-100">
                <h2 className="text-xl font-semibold text-primary-800">
                  {editingProcedure ? 'Edit Skin Procedure' : 'Add New Skin Procedure'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Procedure Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                      placeholder="e.g., Laser Treatment"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.filter(cat => cat !== 'All').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                        min="1"
                        placeholder="e.g., 60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                        min="0"
                        step="0.01"
                        placeholder="e.g., 350"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-primary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                      placeholder="Brief description of the procedure"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProcedure(null);
                      setFormData({ name: '', category: '', duration: '', cost: '', description: '' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-pink-500 rounded-md hover:from-primary-600 hover:to-pink-600 transition-colors"
                  >
                    {editingProcedure ? 'Update' : 'Add'} Procedure
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinProcedure;