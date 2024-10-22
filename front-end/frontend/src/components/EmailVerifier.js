import React, { useState } from 'react';

const EmailChecker = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/emails/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      setResult(data.result); // 'failed' or 'passed'
    } catch (error) {
      setResult('Error checking email');
    }
  };

  return (
    <div>
      <h1>Email Checker</h1>
      <form onSubmit={handleCheckEmail}>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Check</button>
      </form>
      {result && <p>Result: {result}</p>}
    </div>
  );
};

export default EmailChecker;
