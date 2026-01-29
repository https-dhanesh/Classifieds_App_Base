import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import axios from 'axios';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      tools: [{
        name: "search_classifieds",
        description: "Search for items in the classifieds database based on a keyword.",
        input_schema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search keyword" }
          },
          required: ["query"]
        }
      }]
    });

    const toolUse = msg.content.find(c => c.type === 'tool_use');

    if (toolUse) {
      const query = (toolUse.input as any).query; 
      
      console.log("Claude wants to search for:", query);

      let searchResult = "No results found.";
      try {
        const response = await axios.get(`http://localhost:3001/search?q=${query}`);
        if (response.data && response.data.length > 0) {
          searchResult = JSON.stringify(response.data);
        }
      } catch (err) {
        console.error("Backend search failed");
      }

      const finalMsg = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [
          { role: "user", content: prompt },
          { role: "assistant", content: msg.content },
          { 
            role: "user", 
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: searchResult
              }
            ]
          }
        ],
        tools: [{
          name: "search_classifieds",
          description: "Search for items.",
          input_schema: { type: "object", properties: { query: { type: "string" } } }
        }]
      });

      const finalTextBlock = finalMsg.content.find(block => block.type === "text");

      return NextResponse.json({ answer: (finalTextBlock as any)?.text || "No response generated." });
    }

    const textBlock = msg.content.find(block => block.type === "text");
    return NextResponse.json({ answer: (textBlock as any)?.text || "No response generated." });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}