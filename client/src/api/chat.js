import api from './axiosInstance';

export async function createChatSession() {
  const { data } = await api.post('/chat/sessions');
  return data;
}

export async function getChatSession(sessionId) {
  const { data } = await api.get(`/chat/sessions/${sessionId}`);
  return data;
}

export async function sendChatMessage(sessionId, content, onToken, onDone, onError) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      for (const line of text.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              onDone();
            } else if (data.token) {
              onToken(data.token);
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    }
  } catch (err) {
    onError(err.message);
  }
}
