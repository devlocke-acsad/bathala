#!/usr/bin/env python3
"""
Remove duplicate UI methods from Combat.ts
These methods are now in CombatUI.ts
"""

import re

# List of methods to remove (all now in CombatUI.ts)
METHODS_TO_REMOVE = [
    'createCombatUI',
    'createPlayerUI',
    'createEnemyUI',
    'createHandUI',
    'createPlayedHandUI',
    'createActionButtons',
    'updateActionButtons',
    'createTurnUI',
    'createPokerHandInfoButton',
    'addSampleCard',
    'createRelicsUI',
    'updateRelicsUI',
    'createRelicInventory',
    'createRelicInventoryToggle',
    'updateRelicInventory',
    'showRelicTooltip',
    'hideRelicTooltip',
    'showRelicDetailModal',
    'createButton',
    'updateHandDisplay',
    'createCardSprite',
    'updatePlayerUI',
    'updateEnemyUI',
    'updateTurnUI',
    'createActionResultUI',
    'createDeckSprite',
    'createDiscardSprite',
    'createDeckView',
    'createDiscardView',
    'createDamagePreview',
    'updateDamagePreview',
    'createDDADebugOverlay',
    'toggleDDADebug',
    'updateDDADebugOverlay',
    'getTierColor',
    'createEnemyInfoButton',
]

def find_method_bounds(lines, method_name):
    """Find the start and end line indices for a method"""
    # Pattern to match method declaration
    pattern = rf'^\s+private\s+{re.escape(method_name)}\s*\('
    
    start_idx = None
    for i, line in enumerate(lines):
        if re.match(pattern, line):
            start_idx = i
            break
    
    if start_idx is None:
        return None, None
    
    # Look for JSDoc comment above the method (only immediate comment, not distant ones)
    comment_start = start_idx
    # Only look back 1-3 lines for immediate JSDoc
    for look_back in range(1, 4):
        check_idx = start_idx - look_back
        if check_idx >= 0:
            line = lines[check_idx].strip()
            if line.startswith('/**') or line == '*/' or (line.startswith('*') and not line.startswith('*/')):
                comment_start = check_idx
            elif line and not line.startswith('@deprecated'):
                # If we hit non-comment, non-empty line, stop looking back
                break
        else:
            break
    
    # Find the end by counting braces
    brace_count = 0
    in_method = False
    end_idx = None
    
    for i in range(start_idx, len(lines)):
        line = lines[i]
        
        # Count opening and closing braces
        brace_count += line.count('{')
        brace_count -= line.count('}')
        
        if '{' in line and not in_method:
            in_method = True
        
        # When braces balance, we've found the end
        if in_method and brace_count == 0:
            end_idx = i
            break
    
    return comment_start, end_idx

def remove_methods(input_file, output_file):
    """Remove specified methods from the file"""
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Track which lines to keep
    lines_to_remove = set()
    
    # Find all methods to remove
    for method_name in METHODS_TO_REMOVE:
        start, end = find_method_bounds(lines, method_name)
        if start is not None and end is not None:
            print(f"Found {method_name}: lines {start+1} to {end+1}")
            # Mark lines for removal
            for i in range(start, end + 1):
                lines_to_remove.add(i)
            # Also remove one blank line after the method if it exists
            if end + 1 < len(lines) and lines[end + 1].strip() == '':
                lines_to_remove.add(end + 1)
        else:
            print(f"Method {method_name} not found")
    
    # Write output, keeping only lines not marked for removal
    with open(output_file, 'w', encoding='utf-8') as f:
        for i, line in enumerate(lines):
            if i not in lines_to_remove:
                f.write(line)
    
    removed_count = len(lines_to_remove)
    print(f"\nRemoved {removed_count} lines")
    print(f"Original: {len(lines)} lines")
    print(f"New: {len(lines) - removed_count} lines")

if __name__ == '__main__':
    import sys
    input_file = 'src/game/scenes/Combat.ts'
    output_file = 'src/game/scenes/Combat.ts.new'
    
    remove_methods(input_file, output_file)
    print(f"\nNew file created: {output_file}")
    print("Review the new file, then run:")
    print(f"  mv {output_file} {input_file}")
