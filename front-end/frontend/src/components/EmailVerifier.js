import React, { useState } from 'react';

const EmailVerifier = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/emails/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }), // Envia apenas o e-mail
      });
      const data = await response.json();
      console.log(data);
      setResult(data.result);
    } catch (error) {
      console.error('Error checking email:', error);
      setResult('Error checking email');
    }
  };

  return (
    <div>
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

export default EmailVerifier;
