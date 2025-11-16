import { useState } from 'react';

const GeminiAPITester = () => {
  const [serverStatus, setServerStatus] = useState(null);
  const [apiKeyStatus, setApiKeyStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testMessage, setTestMessage] = useState('Hello, can you introduce yourself?');

  // Test 1: Check if server is running
  const testServerConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://meeting-backend-glfz.onrender.com/', {
        method: 'GET'
      });
      
      if (response.ok) {
        const text = await response.text();
        setServerStatus({
          status: 'success',
          message: 'Server is running',
          data: text
        });
      } else {
        setServerStatus({
          status: 'error',
          message: `Server returned ${response.status}`,
          data: null
        });
      }
    } catch (error) {
      setServerStatus({
        status: 'error',
        message: 'Cannot connect to server. Make sure server is running on port 3001',
        data: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Check API key configuration
  const testAPIKeyConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://meeting-backend-glfz.onrender.com/api/test-gemini', {
        method: 'GET'
      });
      
      const data = await response.json();
      
      setApiKeyStatus({
        status: data.status,
        message: data.message,
        details: data.details || data.models || null,
        availableModels: data.availableModels || 0
      });
    } catch (error) {
      setApiKeyStatus({
        status: 'error',
        message: 'Failed to test API key',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Send actual test message
  const testActualRequest = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('https://meeting-backend-glfz.onrender.com/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: testMessage,
          history: [],
          provider: 'gemini'
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResult({
          status: 'success',
          response: data.response,
          provider: data.provider,
          model: data.model
        });
      } else {
        setTestResult({
          status: 'error',
          response: data.error || data.response || 'Unknown error',
          details: data.details
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        response: 'Network error: ' + error.message,
        details: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Test transcript summarization
  const testTranscriptSummarization = async () => {
    setLoading(true);
    setTestResult(null);
    
    const sampleTranscript = `[10:30:15] John: Good morning everyone, let's start the meeting.
[10:30:22] Sarah: Thanks for organizing this. I have some updates on the project.
[10:30:35] John: Great, please go ahead Sarah.
[10:30:45] Sarah: We completed the frontend design and it's ready for review.
[10:31:02] Mike: That's excellent news. When can we start testing?
[10:31:15] Sarah: We can start testing next Monday if everyone is available.`;

    try {
      const response = await fetch('https://meeting-backend-glfz.onrender.com/api/summarize-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: sampleTranscript
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setTestResult({
          status: 'success',
          response: data.summary,
          provider: data.provider,
          model: data.model,
          type: 'summarization'
        });
      } else {
        setTestResult({
          status: 'error',
          response: data.error || 'Failed to generate summary',
          details: data
        });
      }
    } catch (error) {
      setTestResult({
        status: 'error',
        response: 'Network error: ' + error.message,
        details: null
      });
    } finally {
      setLoading(false);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    await testServerConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testAPIKeyConfig();
    await new Promise(resolve => setTimeout(resolve, 500));
    await testActualRequest();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 mb-6 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔬 Gemini API Tester
          </h1>
          <p className="text-gray-300">
            Diagnose and test your Gemini API configuration
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Run All Tests
          </button>

          <button
            onClick={() => {
              setServerStatus(null);
              setApiKeyStatus(null);
              setTestResult(null);
            }}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-xl transition-all border border-white/20"
          >
            Clear Results
          </button>
        </div>

        {/* Individual Tests */}
        <div className="space-y-4 mb-6">
          {/* Test 1: Server Connection */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">1️⃣</span>
                Server Connection Test
              </h2>
              <button
                onClick={testServerConnection}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                Test
              </button>
            </div>
            
            {serverStatus && (
              <div className={`p-4 rounded-lg ${
                serverStatus.status === 'success' 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {serverStatus.status === 'success' ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`font-bold ${
                    serverStatus.status === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {serverStatus.message}
                  </span>
                </div>
                {serverStatus.data && (
                  <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded mt-2 overflow-x-auto">
                    {serverStatus.data}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Test 2: API Key Configuration */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">2️⃣</span>
                API Key Configuration Test
              </h2>
              <button
                onClick={testAPIKeyConfig}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                Test
              </button>
            </div>
            
            {apiKeyStatus && (
              <div className={`p-4 rounded-lg ${
                apiKeyStatus.status === 'success' 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {apiKeyStatus.status === 'success' ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`font-bold ${
                    apiKeyStatus.status === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {apiKeyStatus.message}
                  </span>
                </div>
                
                {apiKeyStatus.availableModels > 0 && (
                  <div className="text-sm text-gray-300 mt-2">
                    ✅ Found {apiKeyStatus.availableModels} available model(s)
                  </div>
                )}
                
                {apiKeyStatus.details && (
                  <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded mt-2 overflow-x-auto">
                    {typeof apiKeyStatus.details === 'string' 
                      ? apiKeyStatus.details 
                      : JSON.stringify(apiKeyStatus.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Test 3: Chatbot API */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">3️⃣</span>
                Chatbot API Test
              </h2>
              <button
                onClick={testActualRequest}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                Test
              </button>
            </div>
            
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter test message..."
            />
            
            {testResult && testResult.type !== 'summarization' && (
              <div className={`p-4 rounded-lg ${
                testResult.status === 'success' 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.status === 'success' ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`font-bold ${
                    testResult.status === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {testResult.status === 'success' ? 'Success!' : 'Failed'}
                  </span>
                  {testResult.model && (
                    <span className="text-xs text-gray-400">
                      ({testResult.provider} - {testResult.model})
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-200 bg-black/30 p-3 rounded mt-2 whitespace-pre-wrap">
                  {testResult.response}
                </div>
              </div>
            )}
          </div>

          {/* Test 4: Transcript Summarization */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">4️⃣</span>
                Transcript Summarization Test
              </h2>
              <button
                onClick={testTranscriptSummarization}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                Test
              </button>
            </div>
            
            <p className="text-sm text-gray-300 mb-4">
              Tests the /api/summarize-transcript endpoint with a sample meeting transcript
            </p>
            
            {testResult && testResult.type === 'summarization' && (
              <div className={`p-4 rounded-lg ${
                testResult.status === 'success' 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {testResult.status === 'success' ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  <span className={`font-bold ${
                    testResult.status === 'success' ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {testResult.status === 'success' ? 'Summary Generated!' : 'Failed'}
                  </span>
                  {testResult.model && (
                    <span className="text-xs text-gray-400">
                      ({testResult.provider} - {testResult.model})
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-200 bg-black/30 p-3 rounded mt-2 whitespace-pre-wrap">
                  {testResult.response}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-500/10 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/30">
          <h3 className="text-lg font-bold text-yellow-300 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Setup Instructions
          </h3>
          <ol className="space-y-2 text-sm text-yellow-200">
            <li>1. Get API key from: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">https://aistudio.google.com/app/apikey</a></li>
            <li>2. Add to <code className="bg-black/30 px-2 py-1 rounded">server/config.env</code>: <code className="bg-black/30 px-2 py-1 rounded">GEMINI_API_KEY=your_key_here</code></li>
            <li>3. Restart your server: <code className="bg-black/30 px-2 py-1 rounded">Ctrl+C</code> then <code className="bg-black/30 px-2 py-1 rounded">npm start</code></li>
            <li>4. Run all tests above</li>
          </ol>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-white text-lg">Testing...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiAPITester;