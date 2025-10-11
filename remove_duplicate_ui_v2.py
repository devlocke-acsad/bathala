#!/usr/bin/env python3
"""
Remove duplicate UI methods from Combat.ts (Phase 2 cleanup)
These methods now exist in CombatUI.ts
"""

import re
import sys

# Methods to remove (now in CombatUI.ts)
METHODS_TO_REMOVE = [
    'createCombatUI',
    'createPlayerUI',
    'createEnemyUI',
    'createHandUI',
    'createActionButtons',
    'updateActionButtons',
    'createHandIndicator',
    'updateHandDisplay',
    'updateHandIndicator',
    'createCardSprite',
    'updatePlayerUI',
    'updateEnemyUI',
    'createPlayerShadow',
    'createEnemyShadow',
    'updatePlayerStatusEffects',
    'updateEnemyStatusEffects',
    'createStatusEffects',
    'updatePlayedHandDisplay',
    'createPokerHandInfoButton',
    'showPokerHandReference',
    'hidePokerHandReference',
]

def find_method_bounds(lines, method_name):
    """
    Find the start and end line indices for a method.
    Returns (start_idx, end_idx) or None if not found.
    """
    # Pattern to match method declaration (private/public)
    method_pattern = re.compile(
        r'^\s*(private|public)\s+' + re.escape(method_name) + r'\s*\('
    )
    
    start_idx = None
    for i, line in enumerate(lines):
        if method_pattern.search(line):
            start_idx = i
            break
    
    if start_idx is None:
        return None
    
    # Find the JSDoc comment start if it exists
    jsdoc_start = start_idx
    for i in range(start_idx - 1, max(0, start_idx - 20), -1):
        if lines[i].strip().startswith('/**'):
            jsdoc_start = i
            break
        elif lines[i].strip() and not lines[i].strip().startswith('*') and not lines[i].strip().startswith('//'):
            # Hit non-comment code, stop looking
            break
    
    # Find the end of the method by counting braces
    brace_count = 0
    found_first_brace = False
    end_idx = start_idx
    
    for i in range(start_idx, len(lines)):
        line = lines[i]
        
        # Count braces
        for char in line:
            if char == '{':
                brace_count += 1
                found_first_brace = True
            elif char == '}':
                brace_count -= 1
                
                # When braces balance after opening, we found the end
                if found_first_brace and brace_count == 0:
                    end_idx = i
                    return (jsdoc_start, end_idx)
    
    # If we didn't find a closing brace, something is wrong
    return None

def remove_methods(input_file, output_file):
    """Remove duplicate UI methods from Combat.ts"""
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    original_count = len(lines)
    print(f"Original file: {original_count} lines")
    
    # Track which lines to keep
    lines_to_remove = set()
    
    for method_name in METHODS_TO_REMOVE:
        bounds = find_method_bounds(lines, method_name)
        if bounds:
            start, end = bounds
            print(f"Found {method_name}: lines {start + 1} to {end + 1} ({end - start + 1} lines)")
            # Mark all lines in this range for removal
            for i in range(start, end + 1):
                lines_to_remove.add(i)
        else:
            print(f"Warning: Could not find method {method_name}")
    
    # Remove the marked lines
    filtered_lines = [line for i, line in enumerate(lines) if i not in lines_to_remove]
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(filtered_lines)
    
    removed_count = len(lines) - len(filtered_lines)
    final_count = len(filtered_lines)
    
    print(f"\nRemoved {removed_count} lines")
    print(f"Final file: {final_count} lines")
    print(f"Reduction: {removed_count} lines ({removed_count / original_count * 100:.1f}%)")

if __name__ == '__main__':
    input_file = 'bathala/src/game/scenes/Combat.ts'
    output_file = 'bathala/src/game/scenes/Combat.ts.cleaned'
    
    print("Phase 2: Removing duplicate UI methods from Combat.ts")
    print("=" * 60)
    
    remove_methods(input_file, output_file)
    
    print("\n" + "=" * 60)
    print("✓ Cleanup complete!")
    print(f"Review the output at: {output_file}")
    print("If it looks good, run:")
    print(f"  mv {output_file} {input_file}")
