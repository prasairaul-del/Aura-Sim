"""
Structured logging utilities.
"""

import logging
import sys
from datetime import datetime
from typing import Any, Optional


class StructuredLogger:
    """
    Structured logger for simulation events.
    """
    
    def __init__(self, name: str = "aura_sim"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(logging.DEBUG)
        
        # Console handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.DEBUG)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def info(self, message: str, **kwargs) -> None:
        self.logger.info(f"{message} | {kwargs}")
    
    def debug(self, message: str, **kwargs) -> None:
        self.logger.debug(f"{message} | {kwargs}")
    
    def warning(self, message: str, **kwargs) -> None:
        self.logger.warning(f"{message} | {kwargs}")
    
    def error(self, message: str, **kwargs) -> None:
        self.logger.error(f"{message} | {kwargs}")


# Global logger instance
logger = StructuredLogger()


def setup_logging(level: str = "INFO") -> None:
    """Configure logging level."""
    logger.logger.setLevel(getattr(logging, level.upper()))