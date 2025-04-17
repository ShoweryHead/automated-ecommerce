import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/layout/Header';
import Footer from '../../../components/layout/Footer';

export default function EmailDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    campaignsSent: 0,
    averageOpenRate: 0,
    averageClickRate: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [recentSubscribers, setRecentSubscribers] = useState([]);
  
  // Mock data for demonstration
  useEffect(() => {
    // In a real implementation, this would fetch data from the API
    setStats({
      totalSubscribers: 1248,
      activeSubscribers: 1156,
      campaignsSent: 24,
      averageOpenRate: 28.4,
      averageClickRate: 3.2
    });
    
    setRecentCampaigns([
      { id: 1, name: 'April Newsletter', type: 'newsletter', status: 'sent', sentDate: '2025-04-10T10:30:00Z', opens: 312, clicks: 48 },
      { id: 2, name: 'New Product: Static Plus 500', type: 'product_announcement', status: 'scheduled', scheduledDate: '2025-04-16T09:00:00Z' },
      { id: 3, name: 'Spring Promotion', type: 'promotional', status: 'draft', lastUpdated: '2025-04-12T14:45:00Z' },
      { id: 4, name: 'Welcome Series', type: 'welcome', status: 'active', lastUpdated: '2025-04-01T11:20:00Z' }
    ]);
    
    setRecentSubscribers([
      { id: 1, email: 'john.smith@example.com', name: 'John Smith', status: 'subscribed', date: '2025-04-14T10:30:00Z' },
      { id: 2, email: 'sarah.jones@example.com', name: 'Sarah Jones', status: 'subscribed', date: '2025-04-13T09:15:00Z' },
      { id: 3, email: 'michael.brown@example.com', name: 'Michael Brown', status: 'unsubscribed', date: '2025-04-12T14:45:00Z' },
      { id: 4, email: 'lisa.wilson@example.com', name: 'Lisa Wilson', status: 'subscribed', date: '2025-04-11T11:20:00Z' }
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
  
  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case 'newsletter':
        return (
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
        );
      case 'product_announcement':
        return (
          <div className="bg-green-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'promotional':
        return (
          <div className="bg-purple-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm4.707 3.707a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L8.414 9H10a3 3 0 013 3v1a1 1 0 102 0v-1a5 5 0 00-5-5H8.414l1.293-1.293z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case 'welcome':
        return (
          <div className="bg-yellow-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
        );
      case 'inquiry_followup':
        return (
          <div className="bg-red-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
        );
    }
  };
  
  const getCampaignStatusBadge = (status) => {
    switch (status) {
      case 'sent':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Sent
          </span>
        );
      case 'scheduled':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Scheduled
          </span>
        );
      case 'draft':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Draft
          </span>
        );
      case 'active':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
            Active
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  const getSubscriberStatusBadge = (status) => {
    switch (status) {
      case 'subscribed':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Subscribed
          </span>
        );
      case 'unsubscribed':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Unsubscribed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'cleaned':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            Cleaned
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
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
                <h2 className="text-xl font-bold text-gray-800 mb-4">Email Marketing</h2>
                
                <nav className="space-y-2">
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('dashboard')}
                  >
                    Dashboard
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'campaigns' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('campaigns')}
                  >
                    Campaigns
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'templates' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('templates')}
                  >
                    Templates
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'subscribers' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('subscribers')}
                  >
                    Subscribers
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'automations' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('automations')}
                  >
                    Automations
                  </button>
                  
                  <button
                    className={`w-full text-left px-4 py-2 rounded-md ${activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => setActiveTab('settings')}
                  >
                    Settings
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 md:ml-8">
              {activeTab === 'dashboard' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Marketing Dashboard</h1>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Total Subscribers</h3>
                        <div className="bg-blue-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.totalSubscribers}</div>
                      <p className="text-sm text-gray-500">Total subscribers</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Active Subscribers</h3>
                        <div className="bg-green-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.activeSubscribers}</div>
                      <p className="text-sm text-gray-500">Active subscribers</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Campaigns Sent</h3>
                        <div className="bg-purple-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.campaignsSent}</div>
                      <p className="text-sm text-gray-500">Campaigns sent</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Open Rate</h3>
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.averageOpenRate}%</div>
                      <p className="text-sm text-gray-500">Average open rate</p>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-700">Click Rate</h3>
                        <div className="bg-red-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stats.averageClickRate}%</div>
                      <p className="text-sm text-gray-500">Average click rate</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        Create Campaign
                      </button>
                      
                      <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        Add Subscribers
                      </button>
                      
                      <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        Create Template
                      </button>
                      
                      <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        View Reports
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Campaigns */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Campaigns</h2>
                        <Link href="/admin/email/campaigns" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View All
                        </Link>
                      </div>
                      
                      <div className="space-y-4">
                        {recentCampaigns.map(campaign => (
                          <div key={campaign.id} className="flex items-start">
                            {getCampaignTypeIcon(campaign.type)}
                            
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium text-gray-900">{campaign.name}</p>
                                {getCampaignStatusBadge(campaign.status)}
                              </div>
                              
                              <p className="text-sm text-gray-500">
                                {campaign.status === 'sent' && `Sent: ${formatDate(campaign.sentDate)}`}
                                {campaign.status === 'scheduled' && `Scheduled: ${formatDate(campaign.scheduledDate)}`}
                                {(campaign.status === 'draft' || campaign.status === 'active') && `Updated: ${formatDate(campaign.lastUpdated)}`}
                              </p>
                              
                              {campaign.status === 'sent' && (
                                <div className="flex mt-2 text-sm">
                                  <span className="text-green-600 mr-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                    {campaign.opens} opens
                                  </span>
                                  <span className="text-blue-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                                    </svg>
                                    {campaign.clicks} clicks
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Recent Subscribers */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Recent Subscribers</h2>
                        <Link href="/admin/email/subscribers" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          View All
                        </Link>
                      </div>
                      
                      <div className="space-y-4">
                        {recentSubscribers.map(subscriber => (
                          <div key={subscriber.id} className="flex items-center">
                            <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
                              <span className="text-gray-600 font-medium">
                                {subscriber.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between">
                                <p className="font-medium text-gray-900">{subscriber.name}</p>
                                {getSubscriberStatusBadge(subscriber.status)}
                              </div>
                              <p className="text-sm text-gray-500">{subscriber.email}</p>
                              <p className="text-xs text-gray-400">{formatDate(subscriber.date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'campaigns' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Email Campaigns</h1>
                    
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                      Create Campaign
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                          <h2 className="text-xl font-bold text-gray-900">All Campaigns</h2>
                          <p className="text-sm text-gray-500">Manage your email marketing campaigns</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Types</option>
                            <option value="newsletter">Newsletter</option>
                            <option value="product_announcement">Product Announcement</option>
                            <option value="promotional">Promotional</option>
                            <option value="welcome">Welcome</option>
                            <option value="inquiry_followup">Inquiry Follow-up</option>
                          </select>
                          
                          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="sending">Sending</option>
                            <option value="sent">Sent</option>
                            <option value="active">Active</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Campaign
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stats
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentCampaigns.map(campaign => (
                            <tr key={campaign.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getCampaignTypeIcon(campaign.type)}
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {campaign.type === 'newsletter' && 'Newsletter'}
                                  {campaign.type === 'product_announcement' && 'Product Announcement'}
                                  {campaign.type === 'promotional' && 'Promotional'}
                                  {campaign.type === 'welcome' && 'Welcome'}
                                  {campaign.type === 'inquiry_followup' && 'Inquiry Follow-up'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getCampaignStatusBadge(campaign.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {campaign.status === 'sent' && formatDate(campaign.sentDate)}
                                {campaign.status === 'scheduled' && formatDate(campaign.scheduledDate)}
                                {(campaign.status === 'draft' || campaign.status === 'active') && formatDate(campaign.lastUpdated)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {campaign.status === 'sent' ? (
                                  <div>
                                    <div className="text-green-600">
                                      <span className="font-medium">{campaign.opens}</span> opens
                                    </div>
                                    <div className="text-blue-600">
                                      <span className="font-medium">{campaign.clicks}</span> clicks
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  Edit
                                </button>
                                {campaign.status === 'draft' && (
                                  <button className="text-green-600 hover:text-green-900 mr-3">
                                    Schedule
                                  </button>
                                )}
                                {campaign.status === 'scheduled' && (
                                  <button className="text-purple-600 hover:text-purple-900 mr-3">
                                    Send Now
                                  </button>
                                )}
                                {campaign.status === 'sent' && (
                                  <button className="text-yellow-600 hover:text-yellow-900 mr-3">
                                    Report
                                  </button>
                                )}
                                {campaign.status !== 'sent' && (
                                  <button className="text-red-600 hover:text-red-900">
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'templates' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
                    
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                      Create Template
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Template Card - Welcome */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-40 bg-gradient-to-r from-yellow-400 to-yellow-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">Welcome Email</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <span className="text-xs font-medium text-yellow-600 px-2">Default</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Welcome to Our Store</h3>
                        <p className="text-sm text-gray-500 mb-4">Sent to new subscribers</p>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Template Card - Product Announcement */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-40 bg-gradient-to-r from-green-400 to-green-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">Product Announcement</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <span className="text-xs font-medium text-green-600 px-2">Default</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">New Product Announcement</h3>
                        <p className="text-sm text-gray-500 mb-4">Announces new products to subscribers</p>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Template Card - Newsletter */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-40 bg-gradient-to-r from-blue-400 to-blue-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">Newsletter</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <span className="text-xs font-medium text-blue-600 px-2">Default</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Monthly Newsletter</h3>
                        <p className="text-sm text-gray-500 mb-4">Regular updates for subscribers</p>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Template Card - Promotional */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-40 bg-gradient-to-r from-purple-400 to-purple-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">Promotional</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <span className="text-xs font-medium text-purple-600 px-2">Default</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Special Offer</h3>
                        <p className="text-sm text-gray-500 mb-4">Promotional campaigns and offers</p>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Template Card - Inquiry Follow-up */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-40 bg-gradient-to-r from-red-400 to-red-600 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-xl font-bold">Inquiry Follow-up</span>
                        </div>
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1">
                          <span className="text-xs font-medium text-red-600 px-2">Default</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Thank You for Your Inquiry</h3>
                        <p className="text-sm text-gray-500 mb-4">Follow-up for customer inquiries</p>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                            Preview
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add New Template Card */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-dashed border-gray-300">
                      <div className="h-40 bg-gray-50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Create New Template</h3>
                        <p className="text-sm text-gray-500 mb-4">Design a custom email template</p>
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Create Template
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'subscribers' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Email Subscribers</h1>
                    
                    <div className="flex space-x-2">
                      <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        Add Subscriber
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                        Import Subscribers
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                          <h2 className="text-xl font-bold text-gray-900">All Subscribers</h2>
                          <p className="text-sm text-gray-500">Manage your email subscribers</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Status</option>
                            <option value="subscribed">Subscribed</option>
                            <option value="unsubscribed">Unsubscribed</option>
                            <option value="pending">Pending</option>
                            <option value="cleaned">Cleaned</option>
                          </select>
                          
                          <select className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="all">All Sources</option>
                            <option value="website">Website</option>
                            <option value="inquiry">Inquiry</option>
                            <option value="manual">Manual</option>
                            <option value="import">Import</option>
                          </select>
                          
                          <input
                            type="text"
                            placeholder="Search subscribers..."
                            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subscriber
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Source
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date Added
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Engagement
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {recentSubscribers.map(subscriber => (
                            <tr key={subscriber.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="bg-gray-200 rounded-full h-10 w-10 flex items-center justify-center">
                                    <span className="text-gray-600 font-medium">
                                      {subscriber.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{subscriber.name}</div>
                                    <div className="text-sm text-gray-500">{subscriber.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getSubscriberStatusBadge(subscriber.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Website
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(subscriber.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                    <div className={`h-2.5 rounded-full ${
                                      subscriber.status === 'subscribed' ? 'bg-green-600 w-12' : 'bg-red-600 w-0'
                                    }`}></div>
                                  </div>
                                  <span className="ml-2 text-xs text-gray-500">
                                    {subscriber.status === 'subscribed' ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-blue-600 hover:text-blue-900 mr-3">
                                  Edit
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'automations' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Email Automations</h1>
                    
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300">
                      Create Automation
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Automation Card - Welcome Series */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-3 bg-yellow-500"></div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Welcome Series</h3>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Automatically sends welcome emails to new subscribers</p>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Performance</span>
                            <span className="text-gray-900 font-medium">92%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-yellow-500 h-2.5 rounded-full w-11/12"></div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                            Pause
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Automation Card - Product Announcement */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-3 bg-green-500"></div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Product Announcements</h3>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Sends emails when new products are published</p>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Performance</span>
                            <span className="text-gray-900 font-medium">85%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-green-500 h-2.5 rounded-full w-5/6"></div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                            Pause
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Automation Card - Inquiry Follow-up */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-3 bg-red-500"></div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Inquiry Follow-up</h3>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Sends follow-up emails after customer inquiries</p>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Performance</span>
                            <span className="text-gray-900 font-medium">78%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-red-500 h-2.5 rounded-full w-4/5"></div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                            Pause
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Automation Card - Newsletter */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="h-3 bg-blue-500"></div>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Monthly Newsletter</h3>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Automatically sends monthly newsletters</p>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">Next Send</span>
                            <span className="text-gray-900 font-medium">May 1, 2025</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-blue-500 h-2.5 rounded-full w-1/2"></div>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                            Pause
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Add New Automation Card */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-dashed border-gray-300">
                      <div className="p-6">
                        <div className="text-center">
                          <div className="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Create New Automation</h3>
                          <p className="text-sm text-gray-500 mb-4">Set up automated email workflows</p>
                          <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                            Create Automation
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'settings' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Settings</h1>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Mailchimp Integration</h2>
                    
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="apiKey" className="block text-gray-700 font-medium mb-2">API Key</label>
                        <input
                          type="password"
                          id="apiKey"
                          value="••••••••••••••••••••••••••••••"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="serverPrefix" className="block text-gray-700 font-medium mb-2">Server Prefix</label>
                        <input
                          type="text"
                          id="serverPrefix"
                          value="us10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="defaultList" className="block text-gray-700 font-medium mb-2">Default List ID</label>
                        <input
                          type="text"
                          id="defaultList"
                          value="a1b2c3d4e5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          readOnly
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">Connected to Mailchimp</h3>
                          <p className="text-sm text-gray-500">Last synced: April 15, 2025 at 6:30 AM</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
                        >
                          Test Connection
                        </button>
                        
                        <button
                          type="button"
                          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition duration-300"
                        >
                          Update Settings
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Email Sender Settings</h2>
                    
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="fromName" className="block text-gray-700 font-medium mb-2">From Name</label>
                        <input
                          type="text"
                          id="fromName"
                          value="Coating Machines"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="replyTo" className="block text-gray-700 font-medium mb-2">Reply-To Email</label>
                        <input
                          type="email"
                          id="replyTo"
                          value="info@coatingmachines.com"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-300"
                        >
                          Save Settings
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Automation Settings</h2>
                    
                    <form className="space-y-4">
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked
                          />
                          <span className="ml-2 text-gray-700">Enable welcome email for new subscribers</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked
                          />
                          <span className="ml-2 text-gray-700">Send product announcements automatically</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked
                          />
                          <span className="ml-2 text-gray-700">Send inquiry follow-up emails</span>
                        </label>
                      </div>
                      
                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked
                          />
                          <span className="ml-2 text-gray-700">Schedule monthly newsletter automatically</span>
                        </label>
                      </div>
                      
                      <div>
                        <label htmlFor="inquiryDelay" className="block text-gray-700 font-medium mb-2">Inquiry Follow-up Delay (hours)</label>
                        <input
                          type="number"
                          id="inquiryDelay"
                          min="1"
                          max="72"
                          value="24"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newsletterDay" className="block text-gray-700 font-medium mb-2">Newsletter Send Day</label>
                        <select
                          id="newsletterDay"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="1">1st of month</option>
                          <option value="15">15th of month</option>
                          <option value="last">Last day of month</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="button"
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
