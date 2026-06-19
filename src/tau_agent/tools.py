"""Provider-neutral tool definitions and tool execution results."""

from collections.abc import Awaitable, Callable, Mapping
from dataclasses import dataclass
from inspect import signature
from typing import Protocol

from pydantic import BaseModel, ConfigDict, Field

from tau_agent.types import JSONValue


class ToolCancellationToken(Protocol):
    """Minimal cancellation interface accepted by tools."""

    def is_cancelled(self) -> bool:
        """Return whether tool execution should stop."""
        ...


ToolExecutor = Callable[..., Awaitable["AgentToolResult"]]


class ToolCall(BaseModel):
    """A request from the assistant to execute a named tool."""

    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    arguments: dict[str, JSONValue] = Field(default_factory=dict)


class AgentToolResult(BaseModel):
    """Structured result returned by a tool execution."""

    model_config = ConfigDict(extra="forbid")

    tool_call_id: str
    name: str
    ok: bool
    content: str
    data: dict[str, JSONValue] | None = None
    details: dict[str, JSONValue] | None = None
    error: str | None = None


@dataclass(frozen=True, slots=True)
class AgentTool:
    """A tool that can be exposed to an agent loop."""

    name: str
    description: str
    input_schema: Mapping[str, JSONValue]
    executor: ToolExecutor
    prompt_snippet: str | None = None
    prompt_guidelines: tuple[str, ...] = ()

    async def execute(
        self,
        arguments: Mapping[str, JSONValue],
        signal: ToolCancellationToken | None = None,
    ) -> AgentToolResult:
        """Execute the tool with provider-neutral JSON-like arguments."""
        if _accepts_signal(self.executor):
            return await self.executor(arguments, signal)
        return await self.executor(arguments)


def _accepts_signal(executor: ToolExecutor) -> bool:
    try:
        parameters = signature(executor).parameters
    except (TypeError, ValueError):
        return False
    return len(parameters) >= 2
