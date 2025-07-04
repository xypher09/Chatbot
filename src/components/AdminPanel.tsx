import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw, 
  Search, 
  Download, 
  Trash2, 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Settings,
  Database,
  AlertTriangle,
  Power,
  Edit3,
  Save,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import { adminMockApi } from '../services/adminMockApi';
import { 
  Document, 
  PerformanceData, 
  InteractionLogsResponse, 
  SystemStatus,
  AnalyticsFilters,
  AuthResponse
} from '../types/admin';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'analytics' | 'system'>('knowledge');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // Knowledge Management State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isIndexing, setIsIndexing] = useState(false);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResult, setRagResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  // Analytics State
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLogsResponse | null>(null);
  const [analyticsFilters, setAnalyticsFilters] = useState<AnalyticsFilters>({
    page: 1,
    page_size: 20
  });
  
  // System State
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [isEditingMessage, setIsEditingMessage] = useState(false);

  // Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      // MOCK API CALL - Replace with actual authentication endpoint
      const response = await adminMockApi.authenticate(loginForm.username, loginForm.password);
      if ('token' in response) {
        setIsAuthenticated(true);
        loadInitialData();
      } else {
        setLoginError(response.detail);
      }
    } catch (error) {
      setLoginError('Authentication failed');
    }
  };

  const loadInitialData = async () => {
    try {
      // MOCK API CALLS - Replace with actual API endpoints
      const [docsResponse, performanceResponse, systemResponse, maintenanceResponse] = await Promise.all([
        adminMockApi.getDocuments(),
        adminMockApi.getPerformanceData(),
        adminMockApi.getSystemStatus(),
        adminMockApi.getMaintenanceMessage()
      ]);
      
      setDocuments(docsResponse);
      setPerformanceData(performanceResponse);
      setSystemStatus(systemResponse);
      setMaintenanceMessage(maintenanceResponse.message || '');
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  // Knowledge Management Functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
      alert('Only PDF and TXT files are supported');
      return;
    }

    setUploadProgress(0);
    
    try {
      // MOCK API CALL - Replace with actual file upload endpoint
      const response = await adminMockApi.uploadDocument(file, (progress) => {
        setUploadProgress(progress);
      });
      
      // Refresh documents list
      const updatedDocs = await adminMockApi.getDocuments();
      setDocuments(updatedDocs);
      setUploadProgress(null);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress(null);
    }
  };

  const toggleDocumentStatus = async (docId: string, is_enabled: boolean) => {
    try {
      // MOCK API CALL - Replace with actual toggle endpoint
      await adminMockApi.toggleDocument(docId, is_enabled);
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === docId ? { ...doc, is_enabled } : doc
        )
      );
    } catch (error) {
      console.error('Failed to toggle document:', error);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      // MOCK API CALL - Replace with actual delete endpoint
      await adminMockApi.deleteDocument(docId);
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const reindexDocuments = async () => {
    setIsIndexing(true);
    try {
      // MOCK API CALL - Replace with actual reindex endpoint
      await adminMockApi.reindexDocuments();
      // Refresh documents list
      const updatedDocs = await adminMockApi.getDocuments();
      setDocuments(updatedDocs);
    } catch (error) {
      console.error('Reindexing failed:', error);
    } finally {
      setIsIndexing(false);
    }
  };

  const testRAGQuery = async () => {
    if (!ragQuery.trim()) return;
    
    try {
      // MOCK API CALL - Replace with actual RAG test endpoint
      const result = await adminMockApi.testRAGQuery(ragQuery);
      setRagResult(result);
    } catch (error) {
      console.error('RAG query failed:', error);
    }
  };

  // Analytics Functions
  const loadInteractionLogs = async () => {
    try {
      // MOCK API CALL - Replace with actual logs endpoint
      const logs = await adminMockApi.getInteractionLogs(analyticsFilters);
      setInteractionLogs(logs);
    } catch (error) {
      console.error('Failed to load interaction logs:', error);
    }
  };

  const exportData = async (format: 'CSV' | 'XLSX') => {
    try {
      // MOCK API CALL - Replace with actual export endpoint
      const blob = await adminMockApi.exportData(format, analyticsFilters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export.${format.toLowerCase()}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  // System Functions
  const toggleChatbotStatus = async () => {
    if (!systemStatus) return;
    
    try {
      // MOCK API CALL - Replace with actual system toggle endpoint
      const newStatus = systemStatus.isOnline ? 'offline' : 'online';
      await adminMockApi.toggleChatbotStatus(newStatus);
      setSystemStatus(prev => prev ? { ...prev, isOnline: !prev.isOnline } : null);
    } catch (error) {
      console.error('Failed to toggle chatbot status:', error);
    }
  };

  const saveMaintenanceMessage = async () => {
    try {
      // MOCK API CALL - Replace with actual message save endpoint
      await adminMockApi.updateMaintenanceMessage(maintenanceMessage);
      setSystemStatus(prev => prev ? { ...prev, maintenanceMessage } : null);
      setIsEditingMessage(false);
    } catch (error) {
      console.error('Failed to save maintenance message:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadInteractionLogs();
    }
  }, [analyticsFilters, isAuthenticated]);

  if (!isOpen) return null;

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 w-96 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Admin Login</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {loginError && (
              <div className="text-red-600 text-sm">{loginError}</div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
          
          <div className="mt-4 text-xs text-slate-500 text-center">
            Demo credentials: admin / password
          </div>
        </div>
      </div>
    );
  }

  // Main Admin Panel
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 text-white p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">University AI Assistant - Admin Panel</h1>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
          <div className="flex space-x-6">
            {[
              { id: 'knowledge', label: 'Knowledge Management', icon: FileText },
              { id: 'analytics', label: 'Analytics & Data', icon: BarChart3 },
              { id: 'system', label: 'System Controls', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'knowledge' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* Document Management */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">Document Sources</h3>
                      <div className="flex items-center gap-2">
                        <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
                          <Upload size={16} className="inline mr-2" />
                          Upload
                          <input
                            type="file"
                            accept=".pdf,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={reindexDocuments}
                          disabled={isIndexing}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <RefreshCw size={16} className={isIndexing ? 'animate-spin' : ''} />
                          {isIndexing ? 'Indexing...' : 'Re-Index'}
                        </button>
                      </div>
                    </div>

                    {uploadProgress !== null && (
                      <div className="mb-4">
                        <div className="bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-slate-600 mt-1">Uploading... {uploadProgress}%</p>
                      </div>
                    )}

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-slate-500" />
                              <span className="font-medium text-slate-800">{doc.filename}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                doc.status === 'INDEXED' ? 'bg-green-100 text-green-800' :
                                doc.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mt-1">
                              Uploaded {new Date(doc.upload_date).toLocaleDateString()}
                              {doc.last_indexed_date && ` • Indexed ${new Date(doc.last_indexed_date).toLocaleDateString()}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleDocumentStatus(doc.id, !doc.is_enabled)}
                              className="text-slate-500 hover:text-slate-700"
                            >
                              {doc.is_enabled ? <ToggleRight size={20} className="text-green-600" /> : <ToggleLeft size={20} />}
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="text-slate-500 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RAG Playground */}
                <div className="space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">RAG Playground</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Test Query
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={ragQuery}
                            onChange={(e) => setRagQuery(e.target.value)}
                            placeholder="Enter a test question..."
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={testRAGQuery}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Test
                          </button>
                        </div>
                      </div>

                      {ragResult && (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-slate-800 mb-2">Rephrased Question</h4>
                            <div className="bg-blue-50 p-3 rounded-lg text-sm">
                              {ragResult.rephrased_question}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-slate-800 mb-2">Retrieved Chunks</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {ragResult.retrieved_chunks.map((chunk: string, index: number) => (
                                <div key={index} className="bg-yellow-50 p-3 rounded-lg text-sm">
                                  <div className="text-yellow-700">{chunk}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-slate-800 mb-2">Synthesized Answer</h4>
                            <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800">
                              {ragResult.synthesized_answer}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Analytics Overview */}
                {performanceData && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="text-blue-600" size={24} />
                        <div>
                          <p className="text-blue-800 font-semibold text-2xl">
                            {performanceData.total_queries_over_time.reduce((sum, day) => sum + day.count, 0)}
                          </p>
                          <p className="text-blue-600 text-sm">Total Queries</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="text-green-600" size={24} />
                        <div>
                          <p className="text-green-800 font-semibold text-2xl">
                            {Math.round(performanceData.feedback_scores.like_ratio * 100)}%
                          </p>
                          <p className="text-green-600 text-sm">Satisfaction Rate</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                      <div className="flex items-center gap-3">
                        <Users className="text-purple-600" size={24} />
                        <div>
                          <p className="text-purple-800 font-semibold text-2xl">
                            {performanceData.feedback_scores.total_feedback_count}
                          </p>
                          <p className="text-purple-600 text-sm">Total Feedback</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filters and Export */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-800">Interaction Logs</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportData('CSV')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download size={16} />
                        Export CSV
                      </button>
                      <button
                        onClick={() => exportData('XLSX')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Download size={16} />
                        Export XLSX
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="date"
                      value={analyticsFilters.start_date || ''}
                      onChange={(e) => setAnalyticsFilters(prev => ({ ...prev, start_date: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="date"
                      value={analyticsFilters.end_date || ''}
                      onChange={(e) => setAnalyticsFilters(prev => ({ ...prev, end_date: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Search interactions..."
                      value={analyticsFilters.search_query || ''}
                      onChange={(e) => setAnalyticsFilters(prev => ({ ...prev, search_query: e.target.value }))}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={loadInteractionLogs}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Filter size={16} />
                      Apply Filters
                    </button>
                  </div>

                  {interactionLogs && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 font-medium text-slate-700">Timestamp</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700">User Query</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700">Bot Response</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700">Feedback</th>
                            <th className="text-left py-3 px-4 font-medium text-slate-700">Session ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {interactionLogs.interactions.map((log) => (
                            <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-600">
                                {new Date(log.created_at).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-slate-800 max-w-xs truncate">
                                {log.user_query}
                              </td>
                              <td className="py-3 px-4 text-slate-800 max-w-xs truncate">
                                {log.bot_response_snippet}
                              </td>
                              <td className="py-3 px-4">
                                {log.feedback ? (
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    log.feedback === 'LIKE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {log.feedback}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">No feedback</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-slate-500 font-mono text-xs">
                                {log.session_id.substring(0, 8)}...
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-slate-600">
                          Showing {interactionLogs.interactions.length} of {interactionLogs.total_records} results
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAnalyticsFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                            disabled={(analyticsFilters.page || 1) <= 1}
                            className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <span className="px-3 py-1">
                            Page {analyticsFilters.page || 1}
                          </span>
                          <button
                            onClick={() => setAnalyticsFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                            disabled={interactionLogs.interactions.length < (analyticsFilters.page_size || 20)}
                            className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-6">
                {/* System Status */}
                {systemStatus && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">System Status</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium text-slate-700">Chatbot Status</span>
                          <button
                            onClick={toggleChatbotStatus}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                              systemStatus.isOnline
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            <Power size={16} />
                            {systemStatus.isOnline ? 'ONLINE' : 'OFFLINE'}
                          </button>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">API Health:</span>
                            <span className={systemStatus.apiHealth === 'Healthy' ? 'text-green-600' : 'text-red-600'}>
                              {systemStatus.apiHealth}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Database:</span>
                            <span className={systemStatus.databaseStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}>
                              {systemStatus.databaseStatus}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Last Updated:</span>
                            <span className="text-slate-800">
                              {new Date(systemStatus.lastUpdated).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium text-slate-700">Maintenance Message</span>
                          {!isEditingMessage ? (
                            <button
                              onClick={() => setIsEditingMessage(true)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Edit3 size={16} />
                              Edit
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={saveMaintenanceMessage}
                                className="text-green-600 hover:text-green-800 flex items-center gap-1"
                              >
                                <Save size={16} />
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditingMessage(false);
                                  setMaintenanceMessage(systemStatus.maintenanceMessage || '');
                                }}
                                className="text-slate-600 hover:text-slate-800"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {isEditingMessage ? (
                          <textarea
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            placeholder="Enter maintenance message..."
                            className="w-full h-24 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                        ) : (
                          <div className="bg-slate-50 p-3 rounded-lg min-h-[6rem] flex items-center">
                            <p className="text-slate-700">
                              {maintenanceMessage || 'No maintenance message set'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Rate Limiting Configuration */}
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Rate Limiting</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Session Limit (queries per conversation)
                      </label>
                      <input
                        type="number"
                        defaultValue={10}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        30-minute Limit
                      </label>
                      <input
                        type="number"
                        defaultValue={15}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        3-hour Limit
                      </label>
                      <input
                        type="number"
                        defaultValue={50}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                    Update Limits
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;