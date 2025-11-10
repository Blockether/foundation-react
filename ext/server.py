from typing import Any, cast
from agno.agent import Agent

from agno.db.in_memory import InMemoryDb
from agno.models.openai import OpenAIChat

from agno.os import AgentOS
from agno.os.interfaces.agui import AGUI

import os
import uvicorn

MODEL_BASE_URL = os.getenv("BLOCKETHER_LLM_API_BASE_URL", None)
MODEL_API_KEY = os.getenv("BLOCKETHER_LLM_API_KEY", None)
if not MODEL_BASE_URL:
    raise ValueError("BLOCKETHER_LLM_API_BASE_URL environment variable is not set.")

storage = InMemoryDb()

blockether_model = OpenAIChat(id="gpt-4o", base_url=MODEL_BASE_URL)

conversational_agent = Agent(model=blockether_model, db=storage)

agent_os = AgentOS(
    description="Example app with MCP enabled",
    agents=[conversational_agent],
    enable_mcp_server=True,
    interfaces=[AGUI(agent=conversational_agent)],
)

app = agent_os.get_app()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8080")))
