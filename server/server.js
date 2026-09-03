import readline from "node:readline/promises";
import { StateGraph, START, END, MessagesAnnotation } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";



// initialize the LLM
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY, // Default value.
  model: "llama-3.1-8b-instant",
  temperature: 0.7,

});

// DEFINE NODE FUNCTION
function CallNode(state){
// call thellm using api
console.log("Calling LLM with state:", state)
return state
}


// build the Graph
const wrokflow=new StateGraph(MessagesAnnotation).addNode("agent",CallNode,
)
.addEdge("__start__","agent")
.addEdge("agent","__end__")


// compile and invoke the graph
const app= wrokflow.compile()

const rl =readline.createInterface({
    input: process.stdin,
  output: process.stdout
})






async function main() {

    while (true) {
        const userInput = await rl.question("What is your name? ");
        if(userInput.toLowerCase() === "exit") {
            console.log("Exiting...");
            break;
        }

        // Invoke the graph
         const finalState = await app.invoke({
      messages: [{ role: "user", content: userInput }],
    });

        console.log("Final State:", finalState);

    rl.close();
}
}

main();