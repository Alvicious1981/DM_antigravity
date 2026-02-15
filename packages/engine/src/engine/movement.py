
import math

# Grid configuration matching HexMap.tsx (5x5 grid)
GRID_WIDTH = 5
GRID_HEIGHT = 5

def get_coordinates(cell_id: int) -> tuple[int, int]:
    """Convert 1-based cell ID to (row, col) coordinates."""
    index = cell_id - 1
    row = index // GRID_WIDTH
    col = index % GRID_WIDTH
    return row, col

def calculate_distance(start_cell: int, end_cell: int) -> int:
    """
    Calculate distance between two cells using Chebyshev distance.
    (Diagonals count as 1 square, common in grid combat variants or simple approximations).
    """
    r1, c1 = get_coordinates(start_cell)
    r2, c2 = get_coordinates(end_cell)
    
    return max(abs(r1 - r2), abs(c1 - c2))

def validate_movement_range(start_cell: int, end_cell: int, speed: int = 6) -> bool:
    """
    Validate if the move is within the character's speed.
    Default speed is 6 squares (30ft).
    """
    distance = calculate_distance(start_cell, end_cell)
    return distance <= speed
