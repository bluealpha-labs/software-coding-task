#!/usr/bin/env python3
"""
Test runner script for the API
"""
import subprocess
import sys
import os

def run_tests():
    """Run all tests with coverage"""
    try:
        # Change to API directory
        api_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(api_dir)
        
        print("🧪 Running API tests...")
        
        # Run tests with coverage
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/", 
            "-v", 
            "--cov=api", 
            "--cov-report=html", 
            "--cov-report=term-missing",
            "--cov-fail-under=80"
        ], capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode == 0:
            print("✅ All tests passed!")
            print("📊 Coverage report generated in htmlcov/index.html")
        else:
            print("❌ Some tests failed!")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
