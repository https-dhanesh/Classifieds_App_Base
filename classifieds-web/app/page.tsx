"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(""); 
  const [aiResponse, setAiResponse] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get('http://localhost:3001/listings');
        setListings(res.data);
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  const handleAiSearch = async (e: any) => {
    if (e.key === 'Enter') {
      setIsAiThinking(true);
      setAiResponse("");

      try {
        const res = await axios.post('/api/chat', { prompt: searchQuery });
        setAiResponse(res.data.answer);

        const gridRes = await axios.get(`http://localhost:3001/search?q=${searchQuery}`);
        setListings(gridRes.data);
        
      } catch (err) {
        console.error(err);
        setAiResponse("Sorry, I couldn't reach Claude. Check your terminal for errors.");
      } finally {
        setIsAiThinking(false);
      }
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">Classifieds Web</h1>

      <div className="max-w-2xl mx-auto mb-10 p-4 bg-white rounded-lg shadow border border-purple-200">
        <p className="text-sm text-gray-500 mb-2"> Ask Claude (e.g., "Find me a cheap laptop")</p>

        <input 
          type="text" 
          placeholder="Type query and hit Enter..." 
          className="w-full p-3 border rounded bg-gray-50 text-black outline-none focus:ring-2 focus:ring-purple-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleAiSearch} 
          disabled={isAiThinking}
        />

        {isAiThinking && (
          <p className="text-xs text-purple-600 mt-2 animate-pulse">
            Claude is thinking & searching database...
          </p>
        )}

        {aiResponse && (
          <div className="mt-4 p-4 bg-purple-50 text-purple-900 rounded border border-purple-100 text-sm whitespace-pre-wrap">
            <strong>Claude:</strong> {aiResponse}
          </div>
        )}
      </div>

      {loading ? <p className="text-center text-black">Loading ads...</p> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((item: any) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-black">{item.title}</h2>
              <p className="text-green-600 font-bold text-lg mt-1">${item.price}</p>
              <p className="text-gray-600 mt-2 text-sm line-clamp-2">{item.description}</p>
              <div className="mt-4 text-xs text-gray-400">Views: {item.views_count || 0}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}