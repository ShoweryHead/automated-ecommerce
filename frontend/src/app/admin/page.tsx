import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProducts: 0,
    automatedProducts: 0,
    queuedProducts: 0,
    scheduledProducts: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    setStats({
      totalProducts: 24,
      automatedProducts: 18,
      queuedProducts: 3,
      scheduledProducts: 2
    });
    
    setRecentActivity([
      { id: 1, type: 'product_created', title: 'Static Plus 500 Powder Coating Machine', date: '2025-04-14T10:30:00Z' },
      { id: 2, type: 'product_scheduled', title: 'Manual Powder Coating Booth', date: '2025-04-14T09:15:00Z' },
      { id: 3, type: 'product_published', title: 'Electric Small Powder Coating Oven', date: '2025-04-13T14:45:00Z' },
      { id: 4, type: 'product_queued', title: 'Gas-Fired Powder Coating Oven', date: '2025-04-13T11:20:00Z' },
      { id: 5, type: 'settings_updated', title: 'Automation Settings Updated', date: '2025-04-12T16:10:00Z' }
    ]);
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'product_created':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'product_scheduled':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'product_published':
        return (
          <div className="bg-purple-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'product_queued':
        return (
          <div className="bg-yellow-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };
  
  return (
    <main>
      <Header />
      
      <div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 mb-8 md:mb-0">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Panel</h2>
                
                <nav className="space-y-2">
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Dashboard
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'product-generation' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('product-generation')}
                  >
                    Product Generation
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'queue' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('queue')}
                  >
                    Generation Queue
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('products')}
                  >
                    Products
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    Automation Settings
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 md:ml-8">
              {activeTab === 'dashboard' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Total Products</h3>
                        <div className="bg-blue-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
                      <p className="text-sm text-gray-500">Products in database</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Automated Products</h3>
                        <div className="bg-green-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.automatedProducts}</div>
                      <p className="text-sm text-gray-500">Auto-generated products</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">In Queue</h3>
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.queuedProducts}</div>
                      <p className="text-sm text-gray-500">Products waiting in queue</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Scheduled</h3>
                        <div className="bg-purple-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.scheduledProducts}</div>
                      <p className="text-sm text-gray-500">Products scheduled for publication</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        Add New Keywords
                      </button>
                      
                      <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        Process Next in Queue
                      </button>
                      
                      <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        Publish Scheduled Products
                      </button>
                    </div>
                  </div>
                  
                  {/* Recent Activity */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                    
                    <div className="space-y-4">
                      {recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-start">
                          {getActivityIcon(activity.type)}
                          
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'product-generation' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Product Generation</h1>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Generate New Product</h2>
                    
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="keywords" className="block text-gray-700 font-medium mb-2">Keywords (1-20)</label>
                        <textarea
                          id="keywords"
                          rows={4}
                          placeholder="Enter keywords separated by commas (e.g., powder coating machine, electrostatic, industrial)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                        <p className="text-sm text-gray-500 mt-1">Enter 1-20 keywords that describe the product you want to generate.</p>
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category</label>
                        <select
                          id="category"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select a category</option>
                          <option value="1">Powder Coating Machines</option>
                          <option value="2">Powder Coating Booths</option>
                          <option value="3">Powder Coating Ovens</option>
                          <option value="4">Accessories & Parts</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="priority" className="block text-gray-700 font-medium mb-2">Priority</label>
                        <select
                          id="priority"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1">Normal</option>
                          <option value="2">High</option>
                          <option value="3">Urgent</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="schedule" className="block text-gray-700 font-medium mb-2">Schedule</label>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="schedule"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="schedule" className="ml-2 text-gray-700">
                            Schedule for later
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="scheduleDate" className="block text-gray-700 font-medium mb-2">Schedule Date</label>
                        <input
                          type="datetime-local"
                          id="scheduleDate"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition duration-300"
                        >
                          Queue for Generation
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              
              {activeTab === 'queue' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Generation Queue</h1>
                  
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Queue Items</h2>
                        
                        <div className="flex space-x-2">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                            Process Next
                          </button>
                          
                          <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                            Refresh
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Keywords
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Priority
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Scheduled For
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              1
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              powder coating machine, electrostatic
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Powder Coating Machines
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Queued
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Normal
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Now
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                Process
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              2
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              powder coating booth, manual, spray
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Powder Coating Booths
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Processing
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              High
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Now
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-gray-400 cursor-not-allowed mr-3">
                                Process
                              </button>
                              <button className="text-gray-400 cursor-not-allowed">
                                Delete
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              3
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              powder coating oven, electric, small
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Powder Coating Ovens
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Completed
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Normal
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              2025-04-14 09:00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-green-600 hover:text-green-900 mr-3">
                                View Product
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'products' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Products</h1>
                  
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Product List</h2>
                        
                        <div className="flex space-x-2">
                          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Products</option>
                            <option value="automated">Automated Only</option>
                            <option value="manual">Manual Only</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="published">Published</option>
                          </select>
                          
                          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                            Add New
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              1
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Static Plus 500 Powder Coating Machine
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Powder Coating Machines
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Published
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Automated
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              2025-04-14
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                Edit
                              </button>
                              <button className="text-green-600 hover:text-green-900 mr-3">
                                View
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              2
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Manual Powder Coating Booth
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Powder Coating Booths
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                Scheduled
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Automated
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              2025-04-13
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                Edit
                              </button>
                              <button className="text-green-600 hover:text-green-900 mr-3">
                                View
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              3
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              Electric Small Powder Coating Oven
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Powder Coating Ovens
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Draft
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                Automated
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              2025-04-12
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 mr-3">
                                Edit
                              </button>
                              <button className="text-green-600 hover:text-green-900 mr-3">
                                View
                              </button>
                              <button className="text-red-600 hover:text-red-900">
                                Delete
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Automation Settings</h1>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Product Listing Settings</h2>
                    
                    <form className="space-y-4">
                      <div>
                        <div className="flex items-center mb-4">
                          <input
                            type="checkbox"
                            id="productListingEnabled"
                            checked
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor="productListingEnabled" className="ml-2 text-gray-700 font-medium">
                            Enable Product Listing Automation
                          </label>
                        </div>
                        
                        <div className="ml-6 space-y-4">
                          <div>
                            <label htmlFor="publishFrequency" className="block text-gray-700 font-medium mb-2">Publish Frequency</label>
                            <select
                              id="publishFrequency"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="daily">Daily</option>
                              <option value="every_other_day">Every Other Day</option>
                              <option value="weekly">Weekly</option>
                              <option value="custom" selected>Custom</option>
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="customDaysInterval" className="block text-gray-700 font-medium mb-2">Custom Days Interval</label>
                            <input
                              type="number"
                              id="customDaysInterval"
                              min="1"
                              max="30"
                              value="3"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-sm text-gray-500 mt-1">Number of days between publications.</p>
                          </div>
                          
                          <div>
                            <label htmlFor="publishTime" className="block text-gray-700 font-medium mb-2">Publish Time</label>
                            <input
                              type="time"
                              id="publishTime"
                              value="09:00"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="maxProductsPerMonth" className="block text-gray-700 font-medium mb-2">Max Products Per Month</label>
                            <input
                              type="number"
                              id="maxProductsPerMonth"
                              min="1"
                              max="100"
                              value="10"
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="requireApproval"
                              checked
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="requireApproval" className="ml-2 text-gray-700">
                              Require approval before publishing
                            </label>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Content Generation Settings</h2>
                    
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="model" className="block text-gray-700 font-medium mb-2">AI Model</label>
                        <select
                          id="model"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="gpt-4" selected>GPT-4</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="temperature" className="block text-gray-700 font-medium mb-2">Temperature</label>
                        <input
                          type="range"
                          id="temperature"
                          min="0"
                          max="1"
                          step="0.1"
                          value="0.7"
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>More Focused (0)</span>
                          <span>More Creative (1)</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="generateFAQs"
                          checked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="generateFAQs" className="ml-2 text-gray-700">
                          Generate FAQs for products
                        </label>
                      </div>
                      
                      <div>
                        <label htmlFor="faqCount" className="block text-gray-700 font-medium mb-2">FAQ Count</label>
                        <input
                          type="number"
                          id="faqCount"
                          min="1"
                          max="10"
                          value="5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Image Generation Settings</h2>
                    
                    <form className="space-y-4">
                      <div className="flex items-center mb-4">
                        <input
                          type="checkbox"
                          id="imageGenerationEnabled"
                          checked
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="imageGenerationEnabled" className="ml-2 text-gray-700 font-medium">
                          Enable Image Generation
                        </label>
                      </div>
                      
                      <div>
                        <label htmlFor="imagesPerProduct" className="block text-gray-700 font-medium mb-2">Images Per Product</label>
                        <input
                          type="number"
                          id="imagesPerProduct"
                          min="1"
                          max="10"
                          value="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="preferredStyle" className="block text-gray-700 font-medium mb-2">Preferred Style</label>
                        <select
                          id="preferredStyle"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="realistic" selected>Realistic</option>
                          <option value="product">Product Photography</option>
                          <option value="technical">Technical Illustration</option>
                          <option value="3d">3D Rendering</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition duration-300 mr-2"
                        >
                          Reset to Defaults
                        </button>
                        
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
                        >
                          Save Settings
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
