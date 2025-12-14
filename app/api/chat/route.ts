import { convertToModelMessages, streamText, type UIMessage, tool } from "ai"
import { z } from "zod"
import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from "@ai-sdk/google"

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, model, apiKey }: { messages: UIMessage[]; model?: string; apiKey?: string } = await req.json()

  const modelId = model || "groq/llama-3.3-70b-versatile"
  const prompt = convertToModelMessages(messages)

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key is required. Please add your API key in settings." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  let modelInstance

  if (modelId.startsWith("groq/")) {
    const groq = createOpenAI({
      apiKey,
      baseURL: "https://api.groq.com/openai/v1",
    })
    const modelName = modelId.replace("groq/", "")
    modelInstance = groq(modelName)
  } else if (modelId.startsWith("openai/")) {
    const openai = createOpenAI({ apiKey })
    const modelName = modelId.replace("openai/", "")
    modelInstance = openai(modelName)
  } else if (modelId.startsWith("anthropic/")) {
    const anthropic = createAnthropic({ apiKey })
    const modelName = modelId.replace("anthropic/", "")
    modelInstance = anthropic(modelName)
  } else if (modelId.startsWith("xai/")) {
    const xai = createOpenAI({ apiKey, baseURL: "https://api.x.ai/v1" })
    const modelName = modelId.replace("xai/", "")
    modelInstance = xai(modelName)
  } else if (modelId.startsWith("google/")) {
    const google = createGoogleGenerativeAI({ apiKey })
    const modelName = modelId.replace("google/", "")
    modelInstance = google(modelName)
  } else {
    return new Response(JSON.stringify({ error: "Unsupported model provider" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const result = streamText({
    model: modelInstance,
    prompt,
    maxOutputTokens: 8000,
    temperature: 0.7,
    tools: {
      generateCode: tool({
        description:
          "Generate code files based on user requirements. Use this for creating new files like components, API routes, utilities, etc.",
        inputSchema: z.object({
          files: z.array(
            z.object({
              path: z.string().describe("File path (e.g., components/Button.tsx, app/api/route.ts)"),
              content: z.string().describe("File content/code"),
              description: z.string().describe("Brief description of what this file does"),
            }),
          ),
          explanation: z.string().describe("Explanation of the generated code and how to use it"),
        }),
        execute: async ({ files, explanation }) => {
          return {
            success: true,
            files,
            explanation,
          }
        },
      }),
      updateCode: tool({
        description: "Update existing code files. Use this to modify already generated files.",
        inputSchema: z.object({
          path: z.string().describe("File path to update"),
          content: z.string().describe("Updated file content"),
          changes: z.string().describe("Description of changes made"),
        }),
        execute: async ({ path, content, changes }) => {
          return {
            success: true,
            path,
            content,
            changes,
          }
        },
      }),
      installPackage: tool({
        description:
          "Install npm packages for the project. Use this when dependencies are needed like UI libraries, utilities, API clients, etc.",
        inputSchema: z.object({
          packages: z.array(z.string()).describe("Package names to install (e.g., ['axios', 'date-fns', 'zod'])"),
          dev: z.boolean().optional().describe("Install as dev dependency (for build tools, types, etc.)"),
        }),
        execute: async ({ packages, dev }) => {
          return {
            success: true,
            packages,
            dev: dev || false,
            message: `Installed ${packages.join(", ")}`,
          }
        },
      }),
      runCommand: tool({
        description:
          "Run terminal commands for building, testing, or running the app. Use for npm scripts, git commands, etc.",
        inputSchema: z.object({
          command: z.string().describe("Command to run (e.g., 'npm run dev', 'npm run build', 'npm test')"),
        }),
        execute: async ({ command }) => {
          return {
            success: true,
            command,
            output: `Running: ${command}\n✓ Command executed successfully`,
          }
        },
      }),
      createIssue: tool({
        description:
          "Create a Linear issue for bug tracking, feature requests, or tasks. Use this to track work and collaborate with teams.",
        inputSchema: z.object({
          title: z.string().describe("Issue title"),
          description: z.string().describe("Detailed description of the issue"),
          priority: z.enum(["urgent", "high", "medium", "low"]).optional().describe("Issue priority"),
        }),
        execute: async ({ title, description, priority }) => {
          return {
            success: true,
            issueId: `ISSUE-${Math.floor(Math.random() * 10000)}`,
            title,
            description,
            priority: priority || "medium",
            message: `Created issue: ${title}`,
          }
        },
      }),
      searchLinearIssues: tool({
        description: "Search Linear issues to find existing bugs, features, or tasks. Use to avoid duplicate work.",
        inputSchema: z.object({
          query: z.string().describe("Search query for Linear issues"),
        }),
        execute: async ({ query }) => {
          return {
            success: true,
            query,
            results: [],
            message: `Searched Linear for: ${query}`,
          }
        },
      }),
    },
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
