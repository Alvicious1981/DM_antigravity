import sys
import os
import unittest

# Add packages/engine/src to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

# Discover and run tests
loader = unittest.TestLoader()
start_dir = os.path.join(os.path.dirname(__file__), "tests")
suite = loader.discover(start_dir, pattern="test_*.py")

runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)

if not result.wasSuccessful():
    sys.exit(1)
