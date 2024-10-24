import React, { useState } from 'react';

const EmailVerifier = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true); // Inicia o carregamento
    setResult(''); // Limpa o resultado anterior

    try {
      const response = await fetch('http://localhost:5000/api/emails/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log(data);

      // Verifica se a resposta foi bem-sucedida
      if (response.ok) {
        setResult(data.result); // 'passed' se for bem-sucedido
      } else {
        setResult(data.error || 'failed'); // Exibe mensagem de erro, se disponível
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setResult('Error checking email');
    } finally {
      setLoading(false); // Termina o carregamento
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
        <button type="submit" disabled={loading}>
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>
      {result && <p>Result: {result}</p>}
    </div>
  );
};

export default EmailVerifier;
