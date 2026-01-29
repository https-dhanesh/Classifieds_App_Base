import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const server = new McpServer({
  name: "classifieds-search",
  version: "1.0.0",
});

server.tool(
  "search_classifieds",
  { query: z.string().describe("Search term (e.g. laptop, car)") },
  async ({ query }) => {
    try {
      const response = await axios.get(`http://localhost:3001/search?q=${query}`);
      
      const listings = response.data;
      if (!listings || listings.length === 0) {
        return { content: [{ type: "text", text: "No results found." }] };
      }

      const textResults = listings.map(l => 
        `Title: ${l.title} | Price: $${l.price} | Desc: ${l.description}`
      ).join("\n---\n");

      return {
        content: [{ type: "text", text: textResults }],
      };
    } catch (error) {
      return { content: [{ type: "text", text: "Error connecting to backend." }] };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("MCP Server running...");