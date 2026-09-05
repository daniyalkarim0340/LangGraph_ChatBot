import readline from "node:readline/promises";
import {
  StateGraph,
  START,
  END,
  MessagesAnnotation,
} from "@langchain/langgraph";

import { ChatGroq } from "@langchain/groq";
import { ToolNode, toolsCondition } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { TavilySearch } from "@langchain/tavily";
dotenv.config();



const tool=new TavilySearch({
  apiKey: process.env.TAVILY_API_KEY,
  maxResults: 3,
  topic: "general"
});


const tools=[tool]
// initialize the tool node
const toolNode = new ToolNode(tools);

// Initialize LLM
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
  temperature: 0,
  maxRetries: 3,
}).bindTools(tools);

// Node function
async function callNode(state) {
  const response = await llm.invoke(state.messages);

  return {
    messages: [response],
  };
}

// conditional edges function

function conditionalEdges(state) {
// here put your condition
// whether to call the tools or end the workflow

  



}


// Build graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callNode)
  .addNode("tools", toolNode)
  .addEdge(START, "agent")
  .addEdge(toolsCondition, "agent")
  .addConditionalEdges("agent")


// Compile graph
const app = workflow.compile();

// Readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Main function
async function main() {
  while (true) {
    const userInput = await rl.question("you: ");

    if (userInput.toLowerCase() === "exit") {
      console.log("Exiting...");
      break;
    }

    const finalState = await app.invoke({
      messages: [
        {
          role: "user",
          content: userInput,
        },
      ],
    });

    console.log("AI:", finalState.messages.at(-1).content);
  }

  rl.close();
}

main();