import time
from typing import Dict, Any, List
from dataclasses import dataclass, field

@dataclass
class UsageRecord:
    timestamp: float
    agent_id: str
    prompt_tokens: int
    completion_tokens: int
    model: str
    cost_usd: float

class TokenomicsReporter:
    """
    Centralized service for tracking LLM token usage and estimating costs.
    Pricing for Gemini 1.5 Flash (approximate):
    - Input: $0.075 / 1 million tokens
    - Output: $0.30 / 1 million tokens
    """
    
    # Pricing per 1M tokens
    INPUT_COST_PER_1M = 0.075
    OUTPUT_COST_PER_1M = 0.30
    
    def __init__(self):
        self.history: List[UsageRecord] = []
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0
        self.total_cost_usd = 0.0

    def report_usage(self, agent_id: str, prompt_tokens: int, completion_tokens: int, model: str = "gemini-1.5-flash"):
        """Log usage and calculate cost."""
        cost_in = (prompt_tokens / 1_000_000) * self.INPUT_COST_PER_1M
        cost_out = (completion_tokens / 1_000_000) * self.OUTPUT_COST_PER_1M
        total_cost = cost_in + cost_out
        
        record = UsageRecord(
            timestamp=time.time(),
            agent_id=agent_id,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            model=model,
            cost_usd=total_cost
        )
        
        self.history.append(record)
        self.total_prompt_tokens += prompt_tokens
        self.total_completion_tokens += completion_tokens
        self.total_cost_usd += total_cost
        
        print(f"💰 [Tokenomics] {agent_id} ({model}): In={prompt_tokens}, Out={completion_tokens} | Cost: ${total_cost:.6f} | Session Total: ${self.total_cost_usd:.6f}")
        return record

    def get_session_report(self) -> Dict[str, Any]:
        """Return aggregated session metrics."""
        return {
            "total_tokens": self.total_prompt_tokens + self.total_completion_tokens,
            "total_cost_usd": self.total_cost_usd,
            "request_count": len(self.history),
            "agents": {
                agent: sum(r.cost_usd for r in self.history if r.agent_id == agent)
                for agent in set(r.agent_id for r in self.history)
            }
        }

# Global Singleton
reporter = TokenomicsReporter()
