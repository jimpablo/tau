"""Approximate context-size estimation for Tau coding sessions."""

from tau_agent.messages import AgentMessage
from tau_agent.tools import AgentTool

CHARS_PER_TOKEN = 4
MESSAGE_OVERHEAD_TOKENS = 4
TOOL_OVERHEAD_TOKENS = 16


def estimate_text_tokens(text: str) -> int:
    """Return a deterministic rough token estimate for text."""
    if not text:
        return 0
    return max(1, (len(text) + CHARS_PER_TOKEN - 1) // CHARS_PER_TOKEN)


def estimate_message_tokens(message: AgentMessage) -> int:
    """Return a rough token estimate for one provider-neutral message."""
    match message.role:
        case "user":
            return MESSAGE_OVERHEAD_TOKENS + estimate_text_tokens(message.content)
        case "assistant":
            tool_call_tokens = sum(
                estimate_text_tokens(call.name) + estimate_text_tokens(str(call.arguments))
                for call in message.tool_calls
            )
            return (
                MESSAGE_OVERHEAD_TOKENS
                + estimate_text_tokens(message.content)
                + tool_call_tokens
            )
        case "tool":
            return (
                MESSAGE_OVERHEAD_TOKENS
                + estimate_text_tokens(message.name)
                + estimate_text_tokens(message.content)
            )


def estimate_tool_tokens(tool: AgentTool) -> int:
    """Return a rough token estimate for one tool definition."""
    return (
        TOOL_OVERHEAD_TOKENS
        + estimate_text_tokens(tool.name)
        + estimate_text_tokens(tool.description)
        + estimate_text_tokens(str(tool.input_schema))
    )


def estimate_context_tokens(
    *,
    system: str,
    messages: tuple[AgentMessage, ...],
    tools: tuple[AgentTool, ...],
) -> int:
    """Return a rough estimate of the active provider context size."""
    return (
        estimate_text_tokens(system)
        + sum(estimate_message_tokens(message) for message in messages)
        + sum(estimate_tool_tokens(tool) for tool in tools)
    )
