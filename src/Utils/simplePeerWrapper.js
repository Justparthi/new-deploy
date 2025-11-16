// Wrapper for simple-peer to handle import/export issues
let SimplePeer;

// Check if SimplePeer is available from CDN
if (typeof window !== 'undefined' && window.SimplePeer) {
  SimplePeer = window.SimplePeer;
  console.log('✅ Using SimplePeer from CDN');
} else {
  try {
    // Try different import methods
    if (typeof require !== 'undefined') {
      SimplePeer = require('simple-peer');
      console.log('✅ Using SimplePeer from require');
    } else {
      // Try ES module import
      SimplePeer = null;
      console.log('❌ SimplePeer not available');
    }
  } catch (error) {
    console.error('Failed to load simple-peer:', error);
    SimplePeer = null;
  }
}

if (!SimplePeer) {
  console.error('SimplePeer not available - WebRTC functionality will be limited');
  
  // Create a mock SimplePeer for development
  SimplePeer = class MockSimplePeer {
    constructor(options) {
      console.warn('Using mock SimplePeer - WebRTC functionality disabled');
      this.options = options;
      this.destroyed = false;
    }
    
    on(event, callback) {
      console.log(`Mock SimplePeer: ${event} event registered`);
    }
    
    signal(data) {
      console.log('Mock SimplePeer: signal called with', data);
    }
    
    destroy() {
      this.destroyed = true;
      console.log('Mock SimplePeer: destroyed');
    }
  };
}

export default SimplePeer;
