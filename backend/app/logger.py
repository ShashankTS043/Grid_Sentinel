import logging
import sys

# Configure the logger
logger = logging.getLogger("grid_sentinel")
logger.setLevel(logging.DEBUG)

# Format: Time | Level | Message
formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s", datefmt="%H:%M:%S")

# 1. Console Handler (What you see in terminal)
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# 2. File Handler (Saves to grid.log)
file_handler = logging.FileHandler("grid.log")
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)

def get_logger():
    return logger