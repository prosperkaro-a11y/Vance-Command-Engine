// pages/index.js - SIMPLIFIED TEST VERSION
import React, { useState } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#1A1208',
      color: '#F5C842',
      fontFamily: 'Arial, sans-serif',
      flexDirection: 'column',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>⚡ VANCE OS</h1>
      <p style={{ color: '#C8881A', fontSize: '18px' }}>Voice-Activated Neural Command Engine</p>
      <p style={{ color: '#6B4F28', marginTop: '20px', fontSize: '14px' }}>v5.0 - Loading...</p>
      <button 
        onClick={() => setMessage('VANCE is ready!')}
        style={{
          marginTop: '30px',
          padding: '12px 24px',
          background: 'rgba(200,136,26,0.2)',
          border: '1px solid #C8881A',
          borderRadius: '8px',
          color: '#F5C842',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Test VANCE
      </button>
      {message && (
        <p style={{ marginTop: '20px', color: '#D4A017' }}>{message}</p>
      )}
    </div>
  );
}
