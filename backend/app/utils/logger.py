import logging
import sys
from app.config import get_settings

settings = get_settings()


def setup_logging() -> logging.Logger:
    """
    Configures and returns a centralized application logger.
    """
    log_format = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"
    date_format = "%Y-%m-%d %H:%M:%S"

    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)

    # Configure root logger
    logging.basicConfig(
        level=level,
        format=log_format,
        datefmt=date_format,
        handlers=[logging.StreamHandler(sys.stdout)],
        force=True,
    )

    logger = logging.getLogger("schemeshield")
    logger.setLevel(level)
    return logger


logger = setup_logging()
