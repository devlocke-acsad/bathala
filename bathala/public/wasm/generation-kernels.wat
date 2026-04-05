(module
 (type $0 (func (param i32 i32)))
 (type $1 (func (param i32 i32 i32)))
 (type $2 (func (result i32)))
 (type $3 (func (param i32 i32 i32 i32)))
 (type $4 (func (param i32 i32) (result i32)))
 (type $5 (func (param i32 i32 i32 i32 i32)))
 (type $6 (func (param i32 i32 i32 i32 i32 i32 i32)))
 (type $7 (func (param i32 i32 f64)))
 (type $8 (func (param i32) (result i32)))
 (type $9 (func (param i32 i32 i32 i32) (result i32)))
 (type $10 (func (param i32 i32 i32 i32 i32 i32)))
 (type $11 (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
 (type $12 (func (result f64)))
 (type $13 (func (param i32)))
 (type $14 (func (param i32 i32 i32 i32 i32 i32) (result i32)))
 (type $15 (func))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $~lib/rt/stub/offset (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/GRID (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/PATH_BUF (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/LABELS (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/QUEUE (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/OPEN_F (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/OPEN_IDX (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/G_COST (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/CAME_FROM (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/CLOSED (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/common/grid/currentMaxCells (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/shared/extend-dead-ends/DEAD_ENDS (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/PARAMS (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/rngState (mut i32) (i32.const 1))
 (global $assembly/generation-kernels/submerged-village/buffers/HOUSE_OX (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/HOUSE_OY (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/HOUSE_SHAPE (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_START (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_COUNT (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/HTILES_X (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/HTILES_Y (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/houseCount (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/totalHouseTiles (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/BITMAP_A (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/BITMAP_B (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/TEMP_X (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/buffers/TEMP_Y (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/TMPL_X (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/TMPL_Y (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/tmplTileCount (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/DOOR_DX (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/DOOR_DY (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/doorCount (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/POOL (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/poolSize (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/CTR_X (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/houses/CTR_Y (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/EDGE_A (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/EDGE_B (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/EDGE_D (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/edgeCount (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/COMP_START (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/COMP_SIZE (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/COMP_TILES (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/compTotalTiles (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/submerged-village/roads/compCount (mut i32) (i32.const 0))
 (memory $0 1)
 (data $0 (i32.const 1036) ",")
 (data $0.1 (i32.const 1048) "\02\00\00\00\1c\00\00\00I\00n\00v\00a\00l\00i\00d\00 \00l\00e\00n\00g\00t\00h")
 (data $1 (i32.const 1084) "<")
 (data $1.1 (i32.const 1096) "\02\00\00\00&\00\00\00~\00l\00i\00b\00/\00s\00t\00a\00t\00i\00c\00a\00r\00r\00a\00y\00.\00t\00s")
 (data $2 (i32.const 1148) "<")
 (data $2.1 (i32.const 1160) "\02\00\00\00(\00\00\00A\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e")
 (data $3 (i32.const 1212) "<")
 (data $3.1 (i32.const 1224) "\02\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00s\00t\00u\00b\00.\00t\00s")
 (data $4 (i32.const 1276) ",")
 (data $4.1 (i32.const 1288) "\04\00\00\00\10")
 (data $4.2 (i32.const 1304) "\ff\ff\ff\ff\01")
 (data $5 (i32.const 1324) ",")
 (data $5.1 (i32.const 1336) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\01")
 (data $6 (i32.const 1372) ",")
 (data $6.1 (i32.const 1384) "\04\00\00\00\10")
 (data $6.2 (i32.const 1400) "\ff\ff\ff\ff\01")
 (data $7 (i32.const 1420) ",")
 (data $7.1 (i32.const 1432) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\01")
 (data $8 (i32.const 1468) ",")
 (data $8.1 (i32.const 1480) "\04\00\00\00\10")
 (data $8.2 (i32.const 1496) "\ff\ff\ff\ff\01")
 (data $9 (i32.const 1516) ",")
 (data $9.1 (i32.const 1528) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\01")
 (data $10 (i32.const 1564) ",")
 (data $10.1 (i32.const 1576) "\04\00\00\00\10\00\00\00\00\00\00\00\01\00\00\00\00\00\00\00\ff\ff\ff\ff")
 (data $11 (i32.const 1612) ",")
 (data $11.1 (i32.const 1624) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\00\00\00\00\01")
 (data $12 (i32.const 1660) ",")
 (data $12.1 (i32.const 1672) "\04\00\00\00\10")
 (data $12.2 (i32.const 1688) "\ff\ff\ff\ff\01")
 (data $13 (i32.const 1708) ",")
 (data $13.1 (i32.const 1720) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\01")
 (data $14 (i32.const 1756) ",")
 (data $14.1 (i32.const 1768) "\04\00\00\00\10")
 (data $14.2 (i32.const 1784) "\ff\ff\ff\ff\01")
 (data $15 (i32.const 1804) ",")
 (data $15.1 (i32.const 1816) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\01")
 (data $16 (i32.const 1852) "<")
 (data $16.1 (i32.const 1864) "\04\00\00\00 \00\00\00\ff\ff\ff\ff\00\00\00\00\01\00\00\00\ff\ff\ff\ff\01\00\00\00\ff\ff\ff\ff\00\00\00\00\01")
 (data $17 (i32.const 1916) "<")
 (data $17.1 (i32.const 1928) "\04\00\00\00 \00\00\00\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\ff\00\00\00\00\00\00\00\00\01\00\00\00\01\00\00\00\01")
 (data $18 (i32.const 1980) ",")
 (data $18.1 (i32.const 1992) "\04\00\00\00\10\00\00\00\01\00\00\00\ff\ff\ff\ff")
 (data $19 (i32.const 2028) ",")
 (data $19.1 (i32.const 2040) "\04\00\00\00\10")
 (data $19.2 (i32.const 2056) "\01\00\00\00\ff\ff\ff\ff")
 (data $20 (i32.const 2076) ",")
 (data $20.1 (i32.const 2088) "\04\00\00\00\10")
 (data $20.2 (i32.const 2104) "\ff\ff\ff\ff\01")
 (data $21 (i32.const 2124) ",")
 (data $21.1 (i32.const 2136) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\01")
 (data $22 (i32.const 2172) ",")
 (data $22.1 (i32.const 2184) "\04\00\00\00\10")
 (data $22.2 (i32.const 2200) "\ff\ff\ff\ff\01")
 (data $23 (i32.const 2220) ",")
 (data $23.1 (i32.const 2232) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\01")
 (data $24 (i32.const 2268) ",")
 (data $24.1 (i32.const 2280) "\04\00\00\00\10")
 (data $24.2 (i32.const 2296) "\ff\ff\ff\ff\01")
 (data $25 (i32.const 2316) ",")
 (data $25.1 (i32.const 2328) "\04\00\00\00\10\00\00\00\ff\ff\ff\ff\01")
 (export "ensureCapacity" (func $assembly/generation-kernels/common/grid/ensureCapacity))
 (export "getGridPtr" (func $assembly/generation-kernels/common/grid/getGridPtr))
 (export "getPathPtr" (func $assembly/generation-kernels/common/grid/getPathPtr))
 (export "getMaxCells" (func $assembly/generation-kernels/common/grid/getMaxCells))
 (export "fixDoubleWideInPlace" (func $assembly/generation-kernels/shared/fix-double-wide/fixDoubleWideInPlace))
 (export "extendDeadEndsInPlace" (func $assembly/generation-kernels/shared/extend-dead-ends/extendDeadEndsInPlace))
 (export "enforceMinThickness2x2InPlace" (func $assembly/generation-kernels/shared/enforce-min-thickness/enforceMinThickness2x2InPlace))
 (export "enforceExact2x2BundlesInPlace" (func $assembly/generation-kernels/shared/enforce-exact-bundles/enforceExact2x2BundlesInPlace))
 (export "removeSmallComponentsInPlace" (func $assembly/generation-kernels/shared/remove-small-components/removeSmallComponentsInPlace))
 (export "filterComponentsBySizeAndFootprintInPlace" (func $assembly/generation-kernels/shared/filter-components/filterComponentsBySizeAndFootprintInPlace))
 (export "repairCliffGapsInPlace" (func $assembly/generation-kernels/shared/repair-cliff-gaps/repairCliffGapsInPlace))
 (export "enforceCliffShellIntegrityInPlace" (func $assembly/generation-kernels/shared/cliff-shell-integrity/enforceCliffShellIntegrityInPlace))
 (export "findRoadPathAStar" (func $assembly/generation-kernels/submerged-village/find-road-astar/findRoadPathAStar))
 (export "getParamsPtr" (func $assembly/generation-kernels/submerged-village/buffers/getParamsPtr))
 (export "generateSubmergedVillage" (func $assembly/generation-kernels/submerged-village/algorithm/generateSubmergedVillage))
 (export "memory" (memory $0))
 (start $~start)
 (func $~lib/rt/stub/__new (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $0
  i32.const 1073741804
  i32.gt_u
  if
   i32.const 1168
   i32.const 1232
   i32.const 86
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 16
  i32.add
  local.tee $3
  i32.const 1073741820
  i32.gt_u
  if
   i32.const 1168
   i32.const 1232
   i32.const 33
   i32.const 29
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/rt/stub/offset
  local.set $5
  global.get $~lib/rt/stub/offset
  i32.const 4
  i32.add
  local.tee $2
  local.get $3
  i32.const 19
  i32.add
  i32.const -16
  i32.and
  i32.const 4
  i32.sub
  local.tee $6
  i32.add
  local.tee $3
  memory.size
  local.tee $4
  i32.const 16
  i32.shl
  i32.const 15
  i32.add
  i32.const -16
  i32.and
  local.tee $7
  i32.gt_u
  if
   local.get $4
   local.get $3
   local.get $7
   i32.sub
   i32.const 65535
   i32.add
   i32.const -65536
   i32.and
   i32.const 16
   i32.shr_u
   local.tee $7
   local.get $4
   local.get $7
   i32.gt_s
   select
   memory.grow
   i32.const 0
   i32.lt_s
   if
    local.get $7
    memory.grow
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
   end
  end
  local.get $3
  global.set $~lib/rt/stub/offset
  local.get $5
  local.get $6
  i32.store
  local.get $2
  i32.const 4
  i32.sub
  local.tee $3
  i32.const 0
  i32.store offset=4
  local.get $3
  i32.const 0
  i32.store offset=8
  local.get $3
  local.get $1
  i32.store offset=12
  local.get $3
  local.get $0
  i32.store offset=16
  local.get $2
  i32.const 16
  i32.add
 )
 (func $~lib/staticarray/StaticArray<i32>#constructor (param $0 i32) (result i32)
  (local $1 i32)
  local.get $0
  i32.const 268435455
  i32.gt_u
  if
   i32.const 1056
   i32.const 1104
   i32.const 51
   i32.const 60
   call $~lib/builtins/abort
   unreachable
  end
  local.get $0
  i32.const 2
  i32.shl
  local.tee $0
  i32.const 4
  call $~lib/rt/stub/__new
  local.tee $1
  i32.const 0
  local.get $0
  memory.fill
  local.get $1
 )
 (func $~lib/staticarray/StaticArray<u8>#constructor (result i32)
  (local $0 i32)
  i32.const 16384
  i32.const 5
  call $~lib/rt/stub/__new
  local.tee $0
  i32.const 0
  i32.const 16384
  memory.fill
  local.get $0
 )
 (func $assembly/generation-kernels/common/grid/ensureCapacity (param $0 i32) (result i32)
  local.get $0
  i32.const 0
  i32.le_s
  local.get $0
  i32.const 16384
  i32.gt_s
  i32.or
  if
   i32.const 0
   return
  end
  local.get $0
  global.set $assembly/generation-kernels/common/grid/currentMaxCells
  i32.const 1
 )
 (func $assembly/generation-kernels/common/grid/getGridPtr (result i32)
  global.get $assembly/generation-kernels/common/grid/GRID
 )
 (func $assembly/generation-kernels/common/grid/getPathPtr (result i32)
  global.get $assembly/generation-kernels/common/grid/PATH_BUF
 )
 (func $assembly/generation-kernels/common/grid/getMaxCells (result i32)
  global.get $assembly/generation-kernels/common/grid/currentMaxCells
 )
 (func $~lib/staticarray/StaticArray<i32>#__uset (param $0 i32) (param $1 i32) (param $2 i32)
  local.get $0
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  local.get $2
  i32.store
 )
 (func $assembly/generation-kernels/shared/fix-double-wide/fixDoubleWideInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  i32.const 1
  local.set $5
  loop $while-continue|0
   local.get $4
   local.get $14
   i32.gt_s
   local.get $5
   i32.and
   if
    i32.const 0
    local.set $5
    local.get $14
    i32.const 1
    i32.add
    local.set $14
    i32.const 0
    local.set $9
    loop $for-loop|1
     local.get $9
     local.get $1
     i32.const 1
     i32.sub
     i32.lt_s
     if
      i32.const 0
      local.set $8
      loop $for-loop|2
       local.get $8
       local.get $0
       i32.const 1
       i32.sub
       i32.lt_s
       if
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $9
        i32.mul
        local.tee $6
        local.get $8
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
        if (result i32)
         local.get $2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $6
         local.get $8
         i32.const 1
         i32.add
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         i32.eq
        else
         i32.const 0
        end
        if (result i32)
         local.get $2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $9
         i32.const 1
         i32.add
         local.get $0
         i32.mul
         local.get $8
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         i32.eq
        else
         i32.const 0
        end
        if (result i32)
         local.get $2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $8
         i32.const 1
         i32.add
         local.get $9
         i32.const 1
         i32.add
         local.get $0
         i32.mul
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         i32.eq
        else
         i32.const 0
        end
        if
         local.get $8
         local.set $5
         local.get $9
         local.set $6
         i32.const 999
         local.set $11
         i32.const 0
         local.set $13
         loop $for-loop|3
          local.get $13
          i32.const 4
          i32.lt_s
          if
           local.get $8
           local.get $13
           i32.const 1
           i32.and
           i32.add
           local.tee $12
           local.get $8
           i32.ge_s
           local.get $12
           local.get $8
           i32.const 1
           i32.add
           i32.le_s
           i32.and
           local.get $9
           local.get $13
           i32.const 1
           i32.shr_s
           i32.const 1
           i32.and
           i32.add
           local.tee $10
           i32.const 1
           i32.add
           local.tee $7
           local.get $9
           i32.ge_s
           i32.and
           local.get $9
           i32.const 1
           i32.add
           local.get $7
           i32.ge_s
           i32.and
           if (result i32)
            i32.const 0
           else
            local.get $1
            local.get $7
            i32.gt_s
            if (result i32)
             local.get $2
             global.get $assembly/generation-kernels/common/grid/GRID
             local.get $0
             local.get $7
             i32.mul
             local.get $12
             i32.add
             i32.const 2
             i32.shl
             i32.add
             i32.load
             i32.eq
            else
             i32.const 0
            end
           end
           i32.eqz
           i32.eqz
           local.set $7
           local.get $12
           i32.const 1
           i32.add
           local.tee $15
           local.get $8
           i32.const 1
           i32.add
           i32.le_s
           local.get $8
           local.get $15
           i32.le_s
           i32.and
           local.get $9
           local.get $10
           i32.le_s
           i32.and
           local.get $10
           local.get $9
           i32.const 1
           i32.add
           i32.le_s
           i32.and
           i32.eqz
           if
            local.get $7
            i32.const 1
            i32.add
            local.get $7
            local.get $0
            local.get $15
            i32.gt_s
            if (result i32)
             local.get $2
             global.get $assembly/generation-kernels/common/grid/GRID
             local.get $0
             local.get $10
             i32.mul
             local.get $15
             i32.add
             i32.const 2
             i32.shl
             i32.add
             i32.load
             i32.eq
            else
             i32.const 0
            end
            select
            local.set $7
           end
           local.get $8
           local.get $12
           i32.le_s
           local.get $12
           local.get $8
           i32.const 1
           i32.add
           i32.le_s
           i32.and
           local.get $10
           i32.const 1
           i32.sub
           local.tee $15
           local.get $9
           i32.ge_s
           i32.and
           local.get $9
           i32.const 1
           i32.add
           local.get $15
           i32.ge_s
           i32.and
           i32.eqz
           if
            local.get $7
            i32.const 1
            i32.add
            local.get $7
            local.get $15
            i32.const 0
            i32.ge_s
            if (result i32)
             local.get $2
             global.get $assembly/generation-kernels/common/grid/GRID
             local.get $0
             local.get $15
             i32.mul
             local.get $12
             i32.add
             i32.const 2
             i32.shl
             i32.add
             i32.load
             i32.eq
            else
             i32.const 0
            end
            select
            local.set $7
           end
           local.get $12
           i32.const 1
           i32.sub
           local.tee $15
           local.get $8
           i32.const 1
           i32.add
           i32.le_s
           local.get $8
           local.get $15
           i32.le_s
           i32.and
           local.get $9
           local.get $10
           i32.le_s
           i32.and
           local.get $10
           local.get $9
           i32.const 1
           i32.add
           i32.le_s
           i32.and
           i32.eqz
           if
            local.get $7
            i32.const 1
            i32.add
            local.get $7
            local.get $15
            i32.const 0
            i32.ge_s
            if (result i32)
             local.get $2
             global.get $assembly/generation-kernels/common/grid/GRID
             local.get $0
             local.get $10
             i32.mul
             local.get $15
             i32.add
             i32.const 2
             i32.shl
             i32.add
             i32.load
             i32.eq
            else
             i32.const 0
            end
            select
            local.set $7
           end
           local.get $7
           local.get $11
           i32.lt_s
           if
            local.get $7
            local.set $11
            local.get $10
            local.set $6
            local.get $12
            local.set $5
           end
           local.get $13
           i32.const 1
           i32.add
           local.set $13
           br $for-loop|3
          end
         end
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $6
         i32.mul
         local.get $5
         i32.add
         local.get $3
         call $~lib/staticarray/StaticArray<i32>#__uset
         i32.const 1
         local.set $5
        end
        local.get $8
        i32.const 1
        i32.add
        local.set $8
        br $for-loop|2
       end
      end
      local.get $9
      i32.const 1
      i32.add
      local.set $9
      br $for-loop|1
     end
    end
    br $while-continue|0
   end
  end
 )
 (func $assembly/generation-kernels/shared/extend-dead-ends/extendDeadEndsInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  loop $for-loop|0
   local.get $1
   local.get $5
   i32.gt_s
   if
    i32.const 0
    local.set $6
    loop $for-loop|1
     local.get $0
     local.get $6
     i32.gt_s
     if
      local.get $2
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $5
      i32.mul
      local.get $6
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.eq
      if (result i32)
       local.get $5
       i32.const 1
       i32.add
       local.tee $7
       local.get $1
       i32.lt_s
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $7
        i32.mul
        local.get $6
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       i32.eqz
       i32.eqz
       local.tee $7
       i32.const 1
       i32.add
       local.get $7
       local.get $6
       i32.const 1
       i32.add
       local.tee $7
       local.get $0
       i32.lt_s
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $5
        i32.mul
        local.get $7
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       select
       local.tee $7
       i32.const 1
       i32.add
       local.get $7
       local.get $5
       i32.const 1
       i32.sub
       local.tee $7
       i32.const 0
       i32.ge_s
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $7
        i32.mul
        local.get $6
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       select
       local.tee $7
       i32.const 1
       i32.add
       local.get $7
       local.get $6
       i32.const 1
       i32.sub
       local.tee $7
       i32.const 0
       i32.ge_s
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $5
        i32.mul
        local.get $7
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       select
       i32.const 1
       i32.eq
      else
       i32.const 0
      end
      if
       global.get $assembly/generation-kernels/shared/extend-dead-ends/DEAD_ENDS
       local.get $4
       local.get $0
       local.get $5
       i32.mul
       local.get $6
       i32.add
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $4
       i32.const 1
       i32.add
       local.set $4
      end
      local.get $6
      i32.const 1
      i32.add
      local.set $6
      br $for-loop|1
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  loop $for-loop|2
   local.get $4
   local.get $8
   i32.gt_s
   if
    global.get $assembly/generation-kernels/shared/extend-dead-ends/DEAD_ENDS
    local.get $8
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $6
    local.get $0
    i32.rem_s
    local.set $9
    i32.const -1
    local.set $5
    local.get $6
    local.get $0
    i32.div_s
    local.tee $6
    i32.const 1
    i32.add
    local.tee $7
    local.get $1
    i32.lt_s
    if (result i32)
     local.get $2
     global.get $assembly/generation-kernels/common/grid/GRID
     local.get $0
     local.get $7
     i32.mul
     local.get $9
     i32.add
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.eq
    else
     i32.const 0
    end
    if (result i32)
     local.get $6
     i32.const 1
     i32.add
     local.set $5
     local.get $9
    else
     i32.const -1
    end
    local.tee $7
    i32.const -1
    i32.eq
    local.get $9
    i32.const 1
    i32.add
    local.tee $10
    local.get $0
    i32.lt_s
    i32.and
    if (result i32)
     local.get $2
     global.get $assembly/generation-kernels/common/grid/GRID
     local.get $0
     local.get $6
     i32.mul
     local.get $10
     i32.add
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.eq
    else
     i32.const 0
    end
    if
     local.get $6
     local.set $5
     local.get $9
     i32.const 1
     i32.add
     local.set $7
    end
    local.get $7
    i32.const -1
    i32.eq
    local.get $6
    i32.const 1
    i32.sub
    local.tee $10
    i32.const 0
    i32.ge_s
    i32.and
    if (result i32)
     local.get $2
     global.get $assembly/generation-kernels/common/grid/GRID
     local.get $0
     local.get $10
     i32.mul
     local.get $9
     i32.add
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.eq
    else
     i32.const 0
    end
    if
     local.get $6
     i32.const 1
     i32.sub
     local.set $5
     local.get $9
     local.set $7
    end
    local.get $7
    i32.const -1
    i32.eq
    local.get $9
    i32.const 1
    i32.sub
    local.tee $10
    i32.const 0
    i32.ge_s
    i32.and
    if (result i32)
     local.get $2
     global.get $assembly/generation-kernels/common/grid/GRID
     local.get $0
     local.get $6
     i32.mul
     local.get $10
     i32.add
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.eq
    else
     i32.const 0
    end
    if
     local.get $6
     local.set $5
     local.get $9
     i32.const 1
     i32.sub
     local.set $7
    end
    local.get $7
    i32.const -1
    i32.ne
    if
     local.get $9
     local.get $7
     i32.sub
     local.tee $10
     local.get $9
     i32.add
     local.set $7
     local.get $6
     local.get $5
     i32.sub
     local.tee $9
     local.get $6
     i32.add
     local.set $6
     i32.const 0
     local.set $5
     loop $for-loop|3
      local.get $3
      local.get $5
      i32.gt_s
      if
       block $for-break3
        local.get $0
        local.get $7
        i32.gt_s
        local.get $7
        i32.const 0
        i32.ge_s
        i32.and
        local.get $6
        i32.const 0
        i32.ge_s
        i32.and
        local.get $1
        local.get $6
        i32.gt_s
        i32.and
        i32.eqz
        br_if $for-break3
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $6
        i32.mul
        local.get $7
        i32.add
        local.tee $11
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
        br_if $for-break3
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $11
        local.get $2
        call $~lib/staticarray/StaticArray<i32>#__uset
        local.get $7
        local.get $10
        i32.add
        local.set $7
        local.get $6
        local.get $9
        i32.add
        local.set $6
        local.get $5
        i32.const 1
        i32.add
        local.set $5
        br $for-loop|3
       end
      end
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|2
   end
  end
 )
 (func $assembly/generation-kernels/shared/enforce-min-thickness/enforceMinThickness2x2InPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  loop $for-loop|0
   local.get $4
   local.get $9
   i32.gt_s
   if
    block $for-break0
     i32.const 0
     local.set $5
     i32.const 0
     local.set $7
     loop $for-loop|1
      local.get $1
      local.get $7
      i32.gt_s
      if
       i32.const 0
       local.set $8
       loop $for-loop|2
        local.get $0
        local.get $8
        i32.gt_s
        if
         local.get $2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $7
         i32.mul
         local.tee $6
         local.get $8
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         i32.eq
         if
          local.get $7
          i32.const 1
          i32.add
          local.get $1
          i32.lt_s
          local.get $8
          i32.const 1
          i32.add
          local.tee $10
          local.get $0
          i32.lt_s
          i32.and
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $6
           local.get $10
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $7
           i32.const 1
           i32.add
           local.get $0
           i32.mul
           local.get $8
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $8
           i32.const 1
           i32.add
           local.get $7
           i32.const 1
           i32.add
           local.get $0
           i32.mul
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          i32.eqz
          i32.eqz
          local.tee $6
          i32.eqz
          local.get $8
          i32.const 1
          i32.sub
          local.tee $10
          i32.const 0
          i32.ge_s
          i32.and
          local.get $7
          i32.const 1
          i32.add
          local.get $1
          i32.lt_s
          i32.and
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $7
           i32.mul
           local.get $10
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $8
           i32.const 1
           i32.sub
           local.get $7
           i32.const 1
           i32.add
           local.get $0
           i32.mul
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $7
           i32.const 1
           i32.add
           local.get $0
           i32.mul
           local.get $8
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if
           i32.const 1
           local.set $6
          end
          local.get $6
          i32.eqz
          local.get $8
          i32.const 1
          i32.add
          local.tee $10
          local.get $0
          i32.lt_s
          i32.and
          local.get $7
          i32.const 1
          i32.sub
          i32.const 0
          i32.ge_s
          i32.and
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $7
           i32.mul
           local.get $10
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $7
           i32.const 1
           i32.sub
           local.get $0
           i32.mul
           local.get $8
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $8
           i32.const 1
           i32.add
           local.get $7
           i32.const 1
           i32.sub
           local.get $0
           i32.mul
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if
           i32.const 1
           local.set $6
          end
          i32.const 1
          local.get $6
          local.get $6
          i32.eqz
          local.get $8
          i32.const 1
          i32.sub
          local.tee $10
          i32.const 0
          i32.ge_s
          i32.and
          local.get $7
          i32.const 1
          i32.sub
          i32.const 0
          i32.ge_s
          i32.and
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $7
           i32.mul
           local.get $10
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $7
           i32.const 1
           i32.sub
           local.get $0
           i32.mul
           local.get $8
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          if (result i32)
           local.get $2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $8
           i32.const 1
           i32.sub
           local.get $7
           i32.const 1
           i32.sub
           local.get $0
           i32.mul
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          select
          i32.eqz
          if
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $7
           i32.mul
           local.get $8
           i32.add
           local.get $3
           call $~lib/staticarray/StaticArray<i32>#__uset
           i32.const 1
           local.set $5
          end
         end
         local.get $8
         i32.const 1
         i32.add
         local.set $8
         br $for-loop|2
        end
       end
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|1
      end
     end
     local.get $5
     i32.eqz
     br_if $for-break0
     local.get $9
     i32.const 1
     i32.add
     local.set $9
     br $for-loop|0
    end
   end
  end
 )
 (func $~lib/rt/__newBuffer (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  local.get $0
  i32.const 4
  call $~lib/rt/stub/__new
  local.set $2
  local.get $1
  if
   local.get $2
   local.get $1
   local.get $0
   memory.copy
  end
  local.get $2
 )
 (func $assembly/generation-kernels/shared/enforce-exact-bundles/enforceExact2x2BundlesInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  loop $for-loop|0
   local.get $1
   local.get $8
   i32.gt_s
   if
    i32.const 0
    local.set $9
    loop $for-loop|1
     local.get $0
     local.get $9
     i32.gt_s
     if
      local.get $2
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $8
      i32.mul
      local.tee $7
      local.get $9
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.eq
      if
       local.get $8
       i32.const 1
       i32.add
       local.get $1
       i32.lt_s
       local.get $9
       i32.const 1
       i32.add
       local.tee $10
       local.get $0
       i32.lt_s
       i32.and
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $7
        local.get $10
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $8
        i32.const 1
        i32.add
        local.get $0
        i32.mul
        local.get $9
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $9
        i32.const 1
        i32.add
        local.get $8
        i32.const 1
        i32.add
        local.get $0
        i32.mul
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       i32.eqz
       i32.eqz
       local.tee $7
       i32.eqz
       local.get $9
       i32.const 1
       i32.sub
       local.tee $10
       i32.const 0
       i32.ge_s
       i32.and
       local.get $8
       i32.const 1
       i32.add
       local.get $1
       i32.lt_s
       i32.and
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $8
        i32.mul
        local.get $10
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $9
        i32.const 1
        i32.sub
        local.get $8
        i32.const 1
        i32.add
        local.get $0
        i32.mul
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $8
        i32.const 1
        i32.add
        local.get $0
        i32.mul
        local.get $9
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if
        i32.const 1
        local.set $7
       end
       local.get $7
       i32.eqz
       local.get $9
       i32.const 1
       i32.add
       local.tee $10
       local.get $0
       i32.lt_s
       i32.and
       local.get $8
       i32.const 1
       i32.sub
       i32.const 0
       i32.ge_s
       i32.and
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $8
        i32.mul
        local.get $10
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $8
        i32.const 1
        i32.sub
        local.get $0
        i32.mul
        local.get $9
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $9
        i32.const 1
        i32.add
        local.get $8
        i32.const 1
        i32.sub
        local.get $0
        i32.mul
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if
        i32.const 1
        local.set $7
       end
       i32.const 1
       local.get $7
       local.get $7
       i32.eqz
       local.get $9
       i32.const 1
       i32.sub
       local.tee $10
       i32.const 0
       i32.ge_s
       i32.and
       local.get $8
       i32.const 1
       i32.sub
       i32.const 0
       i32.ge_s
       i32.and
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $8
        i32.mul
        local.get $10
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $8
        i32.const 1
        i32.sub
        local.get $0
        i32.mul
        local.get $9
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       if (result i32)
        local.get $2
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $9
        i32.const 1
        i32.sub
        local.get $8
        i32.const 1
        i32.sub
        local.get $0
        i32.mul
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.eq
       else
        i32.const 0
       end
       select
       i32.eqz
       if
        local.get $4
        if
         i32.const 16
         i32.const 1296
         call $~lib/rt/__newBuffer
         local.set $12
         i32.const 16
         i32.const 1344
         call $~lib/rt/__newBuffer
         local.set $10
         i32.const 0
         local.set $7
         loop $for-loop|2
          local.get $7
          i32.const 4
          i32.lt_s
          if
           local.get $9
           local.get $12
           local.get $7
           i32.const 2
           i32.shl
           local.tee $13
           i32.add
           i32.load
           i32.add
           local.tee $11
           local.get $0
           i32.lt_s
           local.get $11
           i32.const 0
           i32.ge_s
           i32.and
           local.get $8
           local.get $10
           local.get $13
           i32.add
           i32.load
           i32.add
           local.tee $13
           i32.const 0
           i32.ge_s
           i32.and
           local.get $1
           local.get $13
           i32.gt_s
           i32.and
           if (result i32)
            local.get $5
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $13
            i32.mul
            local.get $11
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           if
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $13
            i32.mul
            local.get $11
            i32.add
            local.get $6
            call $~lib/staticarray/StaticArray<i32>#__uset
           end
           local.get $7
           i32.const 1
           i32.add
           local.set $7
           br $for-loop|2
          end
         end
        end
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $8
        i32.mul
        local.get $9
        i32.add
        local.get $3
        call $~lib/staticarray/StaticArray<i32>#__uset
       end
      end
      local.get $9
      i32.const 1
      i32.add
      local.set $9
      br $for-loop|1
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/shared/remove-small-components/removeSmallComponentsInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  local.get $0
  local.get $1
  i32.mul
  local.set $13
  loop $for-loop|0
   local.get $5
   local.get $13
   i32.lt_s
   if
    global.get $assembly/generation-kernels/common/grid/LABELS
    local.get $5
    i32.const 0
    call $~lib/staticarray/StaticArray<i32>#__uset
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $7
   i32.gt_s
   if
    i32.const 0
    local.set $6
    loop $for-loop|2
     local.get $0
     local.get $6
     i32.gt_s
     if
      block $for-continue|2
       local.get $2
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $7
       i32.mul
       local.get $6
       i32.add
       local.tee $9
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.ne
       br_if $for-continue|2
       global.get $assembly/generation-kernels/common/grid/LABELS
       local.get $9
       i32.const 2
       i32.shl
       i32.add
       i32.load
       br_if $for-continue|2
       i32.const 0
       local.set $5
       i32.const 0
       local.set $10
       global.get $assembly/generation-kernels/common/grid/QUEUE
       i32.const 0
       local.get $6
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/common/grid/QUEUE
       i32.const 1
       local.get $7
       call $~lib/staticarray/StaticArray<i32>#__uset
       i32.const 1
       local.set $8
       global.get $assembly/generation-kernels/common/grid/LABELS
       local.get $9
       local.get $11
       i32.const 1
       i32.add
       local.tee $11
       call $~lib/staticarray/StaticArray<i32>#__uset
       loop $while-continue|3
        local.get $5
        local.get $8
        i32.lt_s
        if
         global.get $assembly/generation-kernels/common/grid/QUEUE
         local.get $5
         i32.const 1
         i32.shl
         local.tee $9
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.set $14
         global.get $assembly/generation-kernels/common/grid/QUEUE
         local.get $9
         i32.const 1
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.set $15
         local.get $5
         i32.const 1
         i32.add
         local.set $5
         local.get $10
         i32.const 1
         i32.add
         local.set $10
         i32.const 16
         i32.const 1392
         call $~lib/rt/__newBuffer
         local.set $16
         i32.const 16
         i32.const 1440
         call $~lib/rt/__newBuffer
         local.set $17
         i32.const 0
         local.set $9
         loop $for-loop|4
          local.get $9
          i32.const 4
          i32.lt_s
          if
           block $for-continue|4
            local.get $14
            local.get $16
            local.get $9
            i32.const 2
            i32.shl
            local.tee $18
            i32.add
            i32.load
            i32.add
            local.tee $12
            local.get $0
            i32.lt_s
            local.get $12
            i32.const 0
            i32.ge_s
            i32.and
            local.get $15
            local.get $17
            local.get $18
            i32.add
            i32.load
            i32.add
            local.tee $18
            i32.const 0
            i32.ge_s
            i32.and
            local.get $1
            local.get $18
            i32.gt_s
            i32.and
            i32.eqz
            br_if $for-continue|4
            local.get $2
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $18
            i32.mul
            local.get $12
            i32.add
            local.tee $19
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.ne
            br_if $for-continue|4
            global.get $assembly/generation-kernels/common/grid/LABELS
            local.get $19
            i32.const 2
            i32.shl
            i32.add
            i32.load
            br_if $for-continue|4
            global.get $assembly/generation-kernels/common/grid/LABELS
            local.get $19
            local.get $11
            call $~lib/staticarray/StaticArray<i32>#__uset
            global.get $assembly/generation-kernels/common/grid/QUEUE
            local.get $8
            i32.const 1
            i32.shl
            local.tee $19
            local.get $12
            call $~lib/staticarray/StaticArray<i32>#__uset
            global.get $assembly/generation-kernels/common/grid/QUEUE
            local.get $19
            i32.const 1
            i32.add
            local.get $18
            call $~lib/staticarray/StaticArray<i32>#__uset
            local.get $8
            i32.const 1
            i32.add
            local.set $8
           end
           local.get $9
           i32.const 1
           i32.add
           local.set $9
           br $for-loop|4
          end
         end
         br $while-continue|3
        end
       end
       local.get $4
       local.get $10
       i32.gt_s
       if
        i32.const 0
        local.set $5
        loop $for-loop|5
         local.get $5
         local.get $13
         i32.lt_s
         if
          local.get $11
          global.get $assembly/generation-kernels/common/grid/LABELS
          local.get $5
          i32.const 2
          i32.shl
          i32.add
          i32.load
          i32.eq
          if
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $5
           local.get $0
           i32.div_s
           local.get $0
           i32.mul
           local.get $5
           local.get $0
           i32.rem_s
           i32.add
           local.get $3
           call $~lib/staticarray/StaticArray<i32>#__uset
          end
          local.get $5
          i32.const 1
          i32.add
          local.set $5
          br $for-loop|5
         end
        end
       end
      end
      local.get $6
      i32.const 1
      i32.add
      local.set $6
      br $for-loop|2
     end
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|1
   end
  end
 )
 (func $assembly/generation-kernels/shared/filter-components/filterComponentsBySizeAndFootprintInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  (local $20 i32)
  (local $21 i32)
  (local $22 i32)
  (local $23 i32)
  (local $24 i32)
  (local $25 i32)
  local.get $0
  local.get $1
  i32.mul
  local.set $16
  loop $for-loop|0
   local.get $12
   local.get $16
   i32.lt_s
   if
    global.get $assembly/generation-kernels/common/grid/LABELS
    local.get $12
    i32.const 0
    call $~lib/staticarray/StaticArray<i32>#__uset
    local.get $12
    i32.const 1
    i32.add
    local.set $12
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $1
   local.get $7
   i32.gt_s
   if
    i32.const 0
    local.set $8
    loop $for-loop|2
     local.get $0
     local.get $8
     i32.gt_s
     if
      block $for-continue|2
       local.get $2
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $7
       i32.mul
       local.get $8
       i32.add
       local.tee $13
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.ne
       br_if $for-continue|2
       global.get $assembly/generation-kernels/common/grid/LABELS
       local.get $13
       i32.const 2
       i32.shl
       i32.add
       i32.load
       br_if $for-continue|2
       i32.const 0
       local.set $23
       i32.const 0
       local.set $20
       local.get $8
       local.set $11
       local.get $8
       local.set $10
       local.get $7
       local.set $9
       global.get $assembly/generation-kernels/common/grid/QUEUE
       i32.const 0
       local.get $8
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/common/grid/QUEUE
       i32.const 1
       local.get $7
       local.tee $12
       call $~lib/staticarray/StaticArray<i32>#__uset
       i32.const 1
       local.set $22
       global.get $assembly/generation-kernels/common/grid/LABELS
       local.get $13
       local.get $19
       i32.const 1
       i32.add
       local.tee $19
       call $~lib/staticarray/StaticArray<i32>#__uset
       loop $while-continue|3
        local.get $22
        local.get $23
        i32.gt_s
        if
         global.get $assembly/generation-kernels/common/grid/QUEUE
         local.get $23
         i32.const 1
         i32.shl
         local.tee $13
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.set $24
         local.get $23
         i32.const 1
         i32.add
         local.set $23
         local.get $20
         i32.const 1
         i32.add
         local.set $20
         local.get $24
         local.get $11
         local.get $11
         local.get $24
         i32.gt_s
         select
         local.set $11
         local.get $24
         local.get $10
         local.get $10
         local.get $24
         i32.lt_s
         select
         local.set $10
         global.get $assembly/generation-kernels/common/grid/QUEUE
         local.get $13
         i32.const 1
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.tee $13
         local.get $9
         local.get $9
         local.get $13
         i32.gt_s
         select
         local.set $9
         local.get $13
         local.get $12
         local.get $12
         local.get $13
         i32.lt_s
         select
         local.set $12
         i32.const 16
         i32.const 1488
         call $~lib/rt/__newBuffer
         local.set $15
         i32.const 16
         i32.const 1536
         call $~lib/rt/__newBuffer
         local.set $14
         i32.const 0
         local.set $21
         loop $for-loop|4
          local.get $21
          i32.const 4
          i32.lt_s
          if
           block $for-continue|4
            local.get $24
            local.get $15
            local.get $21
            i32.const 2
            i32.shl
            local.tee $17
            i32.add
            i32.load
            i32.add
            local.tee $18
            local.get $0
            i32.lt_s
            local.get $18
            i32.const 0
            i32.ge_s
            i32.and
            local.get $13
            local.get $14
            local.get $17
            i32.add
            i32.load
            i32.add
            local.tee $17
            i32.const 0
            i32.ge_s
            i32.and
            local.get $1
            local.get $17
            i32.gt_s
            i32.and
            i32.eqz
            br_if $for-continue|4
            local.get $2
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $17
            i32.mul
            local.get $18
            i32.add
            local.tee $25
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.ne
            br_if $for-continue|4
            global.get $assembly/generation-kernels/common/grid/LABELS
            local.get $25
            i32.const 2
            i32.shl
            i32.add
            i32.load
            br_if $for-continue|4
            global.get $assembly/generation-kernels/common/grid/LABELS
            local.get $25
            local.get $19
            call $~lib/staticarray/StaticArray<i32>#__uset
            global.get $assembly/generation-kernels/common/grid/QUEUE
            local.get $22
            i32.const 1
            i32.shl
            local.tee $25
            local.get $18
            call $~lib/staticarray/StaticArray<i32>#__uset
            global.get $assembly/generation-kernels/common/grid/QUEUE
            local.get $25
            i32.const 1
            i32.add
            local.get $17
            call $~lib/staticarray/StaticArray<i32>#__uset
            local.get $22
            i32.const 1
            i32.add
            local.set $22
           end
           local.get $21
           i32.const 1
           i32.add
           local.set $21
           br $for-loop|4
          end
         end
         br $while-continue|3
        end
       end
       local.get $10
       local.get $11
       i32.sub
       i32.const 1
       i32.add
       local.get $5
       i32.lt_s
       local.get $4
       local.get $20
       i32.gt_s
       i32.or
       local.get $12
       local.get $9
       i32.sub
       i32.const 1
       i32.add
       local.get $6
       i32.lt_s
       i32.or
       if
        i32.const 0
        local.set $12
        loop $for-loop|5
         local.get $12
         local.get $16
         i32.lt_s
         if
          local.get $19
          global.get $assembly/generation-kernels/common/grid/LABELS
          local.get $12
          i32.const 2
          i32.shl
          i32.add
          i32.load
          i32.eq
          if
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $12
           local.get $0
           i32.div_s
           local.get $0
           i32.mul
           local.get $12
           local.get $0
           i32.rem_s
           i32.add
           local.get $3
           call $~lib/staticarray/StaticArray<i32>#__uset
          end
          local.get $12
          i32.const 1
          i32.add
          local.set $12
          br $for-loop|5
         end
        end
       end
      end
      local.get $8
      i32.const 1
      i32.add
      local.set $8
      br $for-loop|2
     end
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|1
   end
  end
 )
 (func $assembly/generation-kernels/shared/repair-cliff-gaps/repairCliffGapsInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  loop $for-loop|0
   local.get $5
   local.get $9
   i32.gt_s
   if
    block $for-break0
     i32.const 0
     local.set $6
     i32.const 1
     local.set $8
     loop $for-loop|1
      local.get $8
      local.get $1
      i32.const 1
      i32.sub
      i32.lt_s
      if
       i32.const 1
       local.set $7
       loop $for-loop|2
        local.get $7
        local.get $0
        i32.const 1
        i32.sub
        i32.lt_s
        if
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $8
         i32.mul
         local.tee $10
         local.get $7
         i32.add
         local.tee $12
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.tee $11
         local.get $3
         i32.eq
         local.get $4
         local.get $11
         i32.eq
         i32.or
         local.get $2
         local.get $11
         i32.eq
         i32.or
         i32.eqz
         if
          local.get $4
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $10
          local.get $7
          i32.const 1
          i32.add
          i32.add
          i32.const 2
          i32.shl
          i32.add
          i32.load
          i32.eq
          local.get $4
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $10
          local.get $7
          i32.const 1
          i32.sub
          i32.add
          i32.const 2
          i32.shl
          i32.add
          i32.load
          i32.eq
          i32.and
          local.get $4
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $8
          i32.const 1
          i32.sub
          local.get $0
          i32.mul
          local.get $7
          i32.add
          i32.const 2
          i32.shl
          i32.add
          i32.load
          i32.eq
          local.get $4
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $8
          i32.const 1
          i32.add
          local.get $0
          i32.mul
          local.get $7
          i32.add
          i32.const 2
          i32.shl
          i32.add
          i32.load
          i32.eq
          i32.and
          i32.or
          if
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $12
           local.get $4
           call $~lib/staticarray/StaticArray<i32>#__uset
           i32.const 1
           local.set $6
          end
         end
         local.get $7
         i32.const 1
         i32.add
         local.set $7
         br $for-loop|2
        end
       end
       local.get $8
       i32.const 1
       i32.add
       local.set $8
       br $for-loop|1
      end
     end
     local.get $6
     i32.eqz
     br_if $for-break0
     local.get $9
     i32.const 1
     i32.add
     local.set $9
     br $for-loop|0
    end
   end
  end
 )
 (func $assembly/generation-kernels/shared/cliff-shell-integrity/enforceCliffShellIntegrityInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  loop $for-loop|0
   local.get $6
   local.get $11
   i32.gt_s
   if
    block $for-break0
     i32.const 0
     local.set $10
     i32.const 0
     local.set $8
     loop $for-loop|1
      local.get $1
      local.get $8
      i32.gt_s
      if
       i32.const 0
       local.set $9
       loop $for-loop|2
        local.get $0
        local.get $9
        i32.gt_s
        if
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $8
         i32.mul
         local.get $9
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.tee $7
         local.get $4
         i32.eq
         if (result i32)
          local.get $8
          i32.const 0
          i32.gt_s
          if (result i32)
           local.get $4
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $8
           i32.const 1
           i32.sub
           local.get $0
           i32.mul
           local.get $9
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          i32.eqz
          i32.eqz
          local.tee $7
          i32.const 1
          i32.add
          local.get $7
          local.get $8
          i32.const 1
          i32.add
          local.tee $7
          local.get $1
          i32.lt_s
          if (result i32)
           local.get $4
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $7
           i32.mul
           local.get $9
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          select
          local.tee $7
          i32.const 1
          i32.add
          local.get $7
          local.get $9
          i32.const 0
          i32.gt_s
          if (result i32)
           local.get $4
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $9
           i32.const 1
           i32.sub
           local.get $0
           local.get $8
           i32.mul
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          select
          local.tee $7
          i32.const 1
          i32.add
          local.get $7
          local.get $9
          i32.const 1
          i32.add
          local.tee $7
          local.get $0
          i32.lt_s
          if (result i32)
           local.get $4
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $8
           i32.mul
           local.get $7
           i32.add
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.eq
          else
           i32.const 0
          end
          select
          i32.const 1
          i32.le_s
          if (result i32)
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $8
           i32.mul
           local.get $9
           i32.add
           local.get $2
           call $~lib/staticarray/StaticArray<i32>#__uset
           i32.const 1
          else
           local.get $10
          end
         else
          local.get $3
          local.get $7
          i32.ne
          local.get $2
          local.get $7
          i32.ne
          i32.and
          local.get $5
          local.get $7
          i32.ne
          i32.and
          if (result i32)
           local.get $8
           i32.const 0
           i32.gt_s
           if (result i32)
            local.get $4
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $8
            i32.const 1
            i32.sub
            local.get $0
            i32.mul
            local.get $9
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           i32.eqz
           i32.eqz
           local.tee $7
           i32.eqz
           local.get $8
           i32.const 1
           i32.add
           local.tee $12
           local.get $1
           i32.lt_s
           i32.and
           if (result i32)
            local.get $4
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $12
            i32.mul
            local.get $9
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           if
            i32.const 1
            local.set $7
           end
           local.get $7
           i32.eqz
           local.get $9
           i32.const 0
           i32.gt_s
           i32.and
           if (result i32)
            local.get $4
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $9
            i32.const 1
            i32.sub
            local.get $0
            local.get $8
            i32.mul
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           if
            i32.const 1
            local.set $7
           end
           local.get $7
           i32.eqz
           local.get $9
           i32.const 1
           i32.add
           local.tee $12
           local.get $0
           i32.lt_s
           i32.and
           if (result i32)
            local.get $4
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $8
            i32.mul
            local.get $12
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           if
            i32.const 1
            local.set $7
           end
           local.get $7
           i32.eqz
           local.get $9
           i32.const 0
           i32.gt_s
           i32.and
           local.get $8
           i32.const 0
           i32.gt_s
           i32.and
           if (result i32)
            local.get $4
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $9
            i32.const 1
            i32.sub
            local.get $8
            i32.const 1
            i32.sub
            local.get $0
            i32.mul
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           if
            i32.const 1
            local.set $7
           end
           local.get $7
           i32.eqz
           local.get $9
           i32.const 1
           i32.add
           local.tee $12
           local.get $0
           i32.lt_s
           i32.and
           local.get $8
           i32.const 0
           i32.gt_s
           i32.and
           if (result i32)
            local.get $4
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $8
            i32.const 1
            i32.sub
            local.get $0
            i32.mul
            local.get $12
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           if
            i32.const 1
            local.set $7
           end
           local.get $7
           i32.eqz
           local.get $9
           i32.const 0
           i32.gt_s
           i32.and
           local.get $8
           i32.const 1
           i32.add
           local.tee $12
           local.get $1
           i32.lt_s
           i32.and
           if (result i32)
            local.get $4
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $9
            i32.const 1
            i32.sub
            local.get $0
            local.get $12
            i32.mul
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           if
            i32.const 1
            local.set $7
           end
           local.get $9
           i32.const 0
           i32.gt_s
           i32.const 1
           local.get $7
           local.get $7
           i32.eqz
           local.get $9
           i32.const 1
           i32.add
           local.tee $12
           local.get $0
           i32.lt_s
           i32.and
           local.get $8
           i32.const 1
           i32.add
           local.tee $13
           local.get $1
           i32.lt_s
           i32.and
           if (result i32)
            local.get $4
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $13
            i32.mul
            local.get $12
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.eq
           else
            i32.const 0
           end
           select
           i32.and
           local.get $9
           local.get $0
           i32.const 1
           i32.sub
           i32.lt_s
           i32.and
           local.get $8
           i32.const 0
           i32.gt_s
           i32.and
           local.get $8
           local.get $1
           i32.const 1
           i32.sub
           i32.lt_s
           i32.and
           if (result i32)
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $8
            i32.mul
            local.get $9
            i32.add
            local.get $2
            call $~lib/staticarray/StaticArray<i32>#__uset
            i32.const 1
           else
            local.get $10
           end
          else
           local.get $10
          end
         end
         local.set $10
         local.get $9
         i32.const 1
         i32.add
         local.set $9
         br $for-loop|2
        end
       end
       local.get $8
       i32.const 1
       i32.add
       local.set $8
       br $for-loop|1
      end
     end
     local.get $10
     i32.eqz
     br_if $for-break0
     local.get $11
     i32.const 1
     i32.add
     local.set $11
     br $for-loop|0
    end
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/find-road-astar/findRoadPathAStar (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (param $6 i32) (param $7 i32) (param $8 i32) (param $9 i32) (param $10 i32) (param $11 i32) (param $12 i32) (result i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  (local $20 i32)
  (local $21 i32)
  (local $22 i32)
  (local $23 i32)
  (local $24 i32)
  (local $25 i32)
  (local $26 i32)
  (local $27 i32)
  (local $28 i32)
  (local $29 i32)
  local.get $0
  local.get $1
  i32.mul
  local.tee $14
  i32.const 0
  i32.le_s
  local.get $14
  i32.const 16384
  i32.gt_s
  i32.or
  if
   i32.const -1
   return
  end
  local.get $0
  local.get $3
  i32.mul
  local.get $2
  i32.add
  local.set $16
  local.get $0
  local.get $5
  i32.mul
  local.get $4
  i32.add
  local.set $15
  loop $for-loop|0
   local.get $13
   local.get $14
   i32.lt_s
   if
    global.get $assembly/generation-kernels/common/grid/G_COST
    local.get $13
    i32.const 2147483647
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/common/grid/CAME_FROM
    local.get $13
    i32.const -1
    call $~lib/staticarray/StaticArray<i32>#__uset
    local.get $13
    global.get $assembly/generation-kernels/common/grid/CLOSED
    i32.add
    i32.const 0
    i32.store8
    local.get $13
    i32.const 1
    i32.add
    local.set $13
    br $for-loop|0
   end
  end
  global.get $assembly/generation-kernels/common/grid/G_COST
  local.get $16
  i32.const 0
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/common/grid/OPEN_F
  i32.const 0
  i32.const 0
  local.get $4
  local.get $2
  i32.sub
  local.tee $2
  i32.sub
  local.get $2
  local.get $2
  i32.const 0
  i32.lt_s
  select
  i32.const 0
  local.get $5
  local.get $3
  i32.sub
  local.tee $2
  i32.sub
  local.get $2
  local.get $2
  i32.const 0
  i32.lt_s
  select
  i32.add
  local.get $9
  i32.mul
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/common/grid/OPEN_IDX
  i32.const 0
  local.get $16
  call $~lib/staticarray/StaticArray<i32>#__uset
  i32.const 1
  local.set $3
  i32.const 16
  i32.const 1584
  call $~lib/rt/__newBuffer
  local.set $21
  i32.const 16
  i32.const 1632
  call $~lib/rt/__newBuffer
  local.set $22
  loop $while-continue|1
   local.get $3
   i32.const 0
   i32.gt_s
   if
    local.get $15
    global.get $assembly/generation-kernels/common/grid/OPEN_IDX
    local.get $3
    i32.const 1
    i32.sub
    local.tee $3
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $24
    i32.eq
    if
     i32.const 0
     local.set $1
     local.get $15
     local.set $0
     loop $while-continue|2
      local.get $0
      i32.const -1
      i32.ne
      local.get $1
      i32.const 16384
      i32.lt_s
      i32.and
      if
       global.get $assembly/generation-kernels/common/grid/PATH_BUF
       local.get $1
       local.get $0
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $1
       i32.const 1
       i32.add
       local.set $1
       global.get $assembly/generation-kernels/common/grid/CAME_FROM
       local.get $0
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.set $0
       br $while-continue|2
      end
     end
     i32.const 0
     local.set $0
     local.get $1
     i32.const 1
     i32.sub
     local.set $2
     loop $while-continue|3
      local.get $0
      local.get $2
      i32.lt_s
      if
       global.get $assembly/generation-kernels/common/grid/PATH_BUF
       local.get $0
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.set $3
       global.get $assembly/generation-kernels/common/grid/PATH_BUF
       local.get $0
       global.get $assembly/generation-kernels/common/grid/PATH_BUF
       local.get $2
       i32.const 2
       i32.shl
       i32.add
       i32.load
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/common/grid/PATH_BUF
       local.get $2
       local.get $3
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $0
       i32.const 1
       i32.add
       local.set $0
       local.get $2
       i32.const 1
       i32.sub
       local.set $2
       br $while-continue|3
      end
     end
     local.get $1
     return
    end
    local.get $24
    global.get $assembly/generation-kernels/common/grid/CLOSED
    i32.add
    local.tee $2
    i32.load8_u
    br_if $while-continue|1
    local.get $2
    i32.const 1
    i32.store8
    local.get $24
    local.get $0
    i32.rem_s
    local.set $18
    local.get $24
    local.get $0
    i32.div_s
    local.set $19
    local.get $24
    i32.const 2
    i32.shl
    local.tee $2
    global.get $assembly/generation-kernels/common/grid/G_COST
    i32.add
    i32.load
    local.set $23
    i32.const 0
    local.set $20
    global.get $assembly/generation-kernels/common/grid/CAME_FROM
    local.get $2
    i32.add
    i32.load
    local.tee $17
    i32.const 0
    i32.ge_s
    if (result i32)
     local.get $19
     local.get $17
     local.get $0
     i32.div_s
     i32.sub
     local.set $20
     local.get $18
     local.get $17
     local.get $0
     i32.rem_s
     i32.sub
    else
     i32.const 0
    end
    local.set $25
    i32.const 0
    local.set $16
    loop $for-loop|4
     local.get $16
     i32.const 4
     i32.lt_s
     if
      block $for-continue|4
       local.get $18
       local.get $21
       local.get $16
       i32.const 2
       i32.shl
       local.tee $2
       i32.add
       i32.load
       local.tee $13
       i32.add
       local.tee $14
       local.get $0
       i32.lt_s
       local.get $14
       i32.const 0
       i32.ge_s
       i32.and
       local.get $19
       local.get $2
       local.get $22
       i32.add
       i32.load
       local.tee $26
       i32.add
       local.tee $27
       i32.const 0
       i32.ge_s
       i32.and
       local.get $1
       local.get $27
       i32.gt_s
       i32.and
       i32.eqz
       br_if $for-continue|4
       local.get $0
       local.get $27
       i32.mul
       local.get $14
       i32.add
       local.tee $28
       global.get $assembly/generation-kernels/common/grid/CLOSED
       i32.add
       i32.load8_u
       br_if $for-continue|4
       local.get $28
       i32.const 2
       i32.shl
       local.tee $2
       global.get $assembly/generation-kernels/common/grid/GRID
       i32.add
       i32.load
       local.tee $29
       local.get $6
       i32.eq
       br_if $for-continue|4
       local.get $23
       local.get $10
       local.get $11
       local.get $9
       local.get $8
       local.get $29
       i32.eq
       select
       local.get $7
       local.get $29
       i32.eq
       select
       local.tee $29
       local.get $12
       i32.add
       local.get $29
       local.get $20
       local.get $26
       i32.ne
       local.get $13
       local.get $25
       i32.ne
       i32.or
       select
       local.get $29
       local.get $17
       i32.const 0
       i32.ge_s
       select
       i32.add
       local.tee $13
       global.get $assembly/generation-kernels/common/grid/G_COST
       local.get $2
       i32.add
       i32.load
       i32.ge_s
       br_if $for-continue|4
       global.get $assembly/generation-kernels/common/grid/G_COST
       local.get $28
       local.get $13
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/common/grid/CAME_FROM
       local.get $28
       local.get $24
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $13
       i32.const 0
       local.get $4
       local.get $14
       i32.sub
       local.tee $2
       i32.sub
       local.get $2
       local.get $2
       i32.const 0
       i32.lt_s
       select
       i32.const 0
       local.get $5
       local.get $27
       i32.sub
       local.tee $2
       i32.sub
       local.get $2
       local.get $2
       i32.const 0
       i32.lt_s
       select
       i32.add
       local.get $9
       i32.mul
       i32.add
       local.set $26
       local.get $3
       local.set $2
       loop $while-continue|5
        local.get $2
        i32.const 0
        i32.gt_s
        if (result i32)
         local.get $26
         global.get $assembly/generation-kernels/common/grid/OPEN_F
         local.get $2
         i32.const 1
         i32.sub
         i32.const 2
         i32.shl
         i32.add
         i32.load
         i32.gt_s
        else
         i32.const 0
        end
        if
         local.get $2
         i32.const 1
         i32.sub
         local.set $2
         br $while-continue|5
        end
       end
       local.get $3
       local.set $13
       loop $for-loop|6
        local.get $2
        local.get $13
        i32.lt_s
        if
         global.get $assembly/generation-kernels/common/grid/OPEN_F
         local.get $13
         local.get $13
         i32.const 1
         i32.sub
         local.tee $14
         i32.const 2
         i32.shl
         local.tee $27
         global.get $assembly/generation-kernels/common/grid/OPEN_F
         i32.add
         i32.load
         call $~lib/staticarray/StaticArray<i32>#__uset
         global.get $assembly/generation-kernels/common/grid/OPEN_IDX
         local.get $13
         global.get $assembly/generation-kernels/common/grid/OPEN_IDX
         local.get $27
         i32.add
         i32.load
         call $~lib/staticarray/StaticArray<i32>#__uset
         local.get $14
         local.set $13
         br $for-loop|6
        end
       end
       global.get $assembly/generation-kernels/common/grid/OPEN_F
       local.get $2
       local.get $26
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/common/grid/OPEN_IDX
       local.get $2
       local.get $28
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $3
       i32.const 1
       i32.add
       local.set $3
      end
      local.get $16
      i32.const 1
      i32.add
      local.set $16
      br $for-loop|4
     end
    end
    br $while-continue|1
   end
  end
  i32.const -1
 )
 (func $assembly/generation-kernels/submerged-village/buffers/getParamsPtr (result i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
 )
 (func $assembly/generation-kernels/submerged-village/buffers/rng (result f64)
  (local $0 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/rngState
  i32.const 1831565813
  i32.add
  global.set $assembly/generation-kernels/submerged-village/buffers/rngState
  global.get $assembly/generation-kernels/submerged-village/buffers/rngState
  global.get $assembly/generation-kernels/submerged-village/buffers/rngState
  i32.const 15
  i32.shr_u
  i32.xor
  i64.extend_i32_s
  global.get $assembly/generation-kernels/submerged-village/buffers/rngState
  i64.extend_i32_s
  i64.const 1
  i64.or
  i64.mul
  i32.wrap_i64
  local.tee $0
  local.get $0
  local.get $0
  local.get $0
  i32.const 7
  i32.shr_u
  i32.xor
  i64.extend_i32_s
  local.get $0
  i64.extend_i32_s
  i64.const 61
  i64.or
  i64.mul
  i32.wrap_i64
  i32.add
  i32.xor
  local.tee $0
  i32.const 14
  i32.shr_u
  local.get $0
  i32.xor
  f64.convert_i32_u
  f64.const 2.3283064365386963e-10
  f64.mul
 )
 (func $assembly/generation-kernels/submerged-village/buffers/rngInt (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  call $assembly/generation-kernels/submerged-village/buffers/rng
  local.get $1
  local.get $0
  i32.sub
  i32.const 1
  i32.add
  f64.convert_i32_s
  f64.mul
  f64.floor
  i32.trunc_sat_f64_s
  i32.add
 )
 (func $assembly/generation-kernels/submerged-village/houses/loadRect (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  i32.const 0
  global.set $assembly/generation-kernels/submerged-village/houses/tmplTileCount
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    i32.const 0
    local.set $2
    loop $for-loop|1
     local.get $0
     local.get $2
     i32.gt_s
     if
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_X
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $2
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_Y
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $3
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const 1
      i32.add
      global.set $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $2
      i32.const 1
      i32.add
      local.set $2
      br $for-loop|1
     end
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/houses/loadRectDoors (param $0 i32) (param $1 i32)
  (local $2 i32)
  i32.const 4
  global.set $assembly/generation-kernels/submerged-village/houses/doorCount
  global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
  i32.const 0
  local.get $0
  i32.const 1
  i32.shr_s
  local.tee $2
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
  i32.const 0
  i32.const -1
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
  i32.const 1
  local.get $2
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
  i32.const 1
  local.get $1
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
  i32.const 2
  i32.const -1
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
  i32.const 2
  local.get $1
  i32.const 1
  i32.shr_s
  local.tee $1
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
  i32.const 3
  local.get $0
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
  i32.const 3
  local.get $1
  call $~lib/staticarray/StaticArray<i32>#__uset
 )
 (func $assembly/generation-kernels/submerged-village/houses/loadTemplate (param $0 i32)
  local.get $0
  i32.const 5
  i32.le_s
  if
   local.get $0
   if
    local.get $0
    i32.const 1
    i32.eq
    if
     i32.const 2
     i32.const 3
     call $assembly/generation-kernels/submerged-village/houses/loadRect
     i32.const 2
     i32.const 3
     call $assembly/generation-kernels/submerged-village/houses/loadRectDoors
    else
     local.get $0
     i32.const 2
     i32.eq
     if
      i32.const 3
      i32.const 4
      call $assembly/generation-kernels/submerged-village/houses/loadRect
      i32.const 3
      i32.const 4
      call $assembly/generation-kernels/submerged-village/houses/loadRectDoors
     else
      local.get $0
      i32.const 3
      i32.eq
      if
       i32.const 4
       i32.const 4
       call $assembly/generation-kernels/submerged-village/houses/loadRect
       i32.const 4
       i32.const 4
       call $assembly/generation-kernels/submerged-village/houses/loadRectDoors
      else
       local.get $0
       i32.const 4
       i32.eq
       if
        i32.const 4
        i32.const 6
        call $assembly/generation-kernels/submerged-village/houses/loadRect
        i32.const 4
        i32.const 6
        call $assembly/generation-kernels/submerged-village/houses/loadRectDoors
       else
        i32.const 6
        i32.const 4
        call $assembly/generation-kernels/submerged-village/houses/loadRect
        i32.const 6
        i32.const 4
        call $assembly/generation-kernels/submerged-village/houses/loadRectDoors
       end
      end
     end
    end
   else
    i32.const 3
    i32.const 3
    call $assembly/generation-kernels/submerged-village/houses/loadRect
    i32.const 3
    i32.const 3
    call $assembly/generation-kernels/submerged-village/houses/loadRectDoors
   end
  else
   local.get $0
   i32.const 6
   i32.eq
   if
    i32.const 4
    i32.const 4
    call $assembly/generation-kernels/submerged-village/houses/loadRect
    i32.const 0
    local.set $0
    loop $for-loop|0
     local.get $0
     i32.const 3
     i32.lt_s
     if
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_X
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const 4
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_Y
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $0
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const 1
      i32.add
      global.set $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_X
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const 5
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_Y
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $0
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const 1
      i32.add
      global.set $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|0
     end
    end
    i32.const 4
    global.set $assembly/generation-kernels/submerged-village/houses/doorCount
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.const 0
    i32.const 2
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    i32.const 0
    i32.const -1
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.const 1
    i32.const 2
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    i32.const 1
    i32.const 4
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.const 2
    i32.const -1
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    i32.const 2
    i32.const 2
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.const 3
    i32.const 6
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    i32.const 3
    i32.const 1
    call $~lib/staticarray/StaticArray<i32>#__uset
   else
    i32.const 4
    i32.const 4
    call $assembly/generation-kernels/submerged-village/houses/loadRect
    i32.const 0
    local.set $0
    loop $for-loop|1
     local.get $0
     i32.const 3
     i32.lt_s
     if
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_X
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const -2
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_Y
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $0
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const 1
      i32.add
      global.set $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_X
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const -1
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/TMPL_Y
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $0
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.const 1
      i32.add
      global.set $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      local.get $0
      i32.const 1
      i32.add
      local.set $0
      br $for-loop|1
     end
    end
    i32.const 4
    global.set $assembly/generation-kernels/submerged-village/houses/doorCount
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.const 0
    i32.const 2
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    i32.const 0
    i32.const -1
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.const 1
    i32.const 2
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    i32.const 1
    i32.const 4
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.const 2
    i32.const -3
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    i32.const 2
    i32.const 1
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.const 3
    i32.const 4
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    i32.const 3
    i32.const 2
    call $~lib/staticarray/StaticArray<i32>#__uset
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/houses/pickDoor (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  global.get $assembly/generation-kernels/submerged-village/houses/doorCount
  i32.const 1
  i32.sub
  local.set $4
  loop $for-loop|0
   local.get $4
   i32.const 0
   i32.gt_s
   if
    i32.const 0
    local.get $4
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $5
    local.get $4
    i32.const 2
    i32.shl
    local.tee $6
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.add
    i32.load
    local.set $7
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    local.get $4
    local.get $5
    i32.const 2
    i32.shl
    local.tee $8
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    i32.add
    i32.load
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
    local.get $5
    local.get $7
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    local.get $6
    i32.add
    i32.load
    local.set $6
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    local.get $4
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    local.get $8
    i32.add
    i32.load
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
    local.get $5
    local.get $6
    call $~lib/staticarray/StaticArray<i32>#__uset
    local.get $4
    i32.const 1
    i32.sub
    local.set $4
    br $for-loop|0
   end
  end
  i32.const 0
  local.set $4
  loop $for-loop|1
   local.get $4
   global.get $assembly/generation-kernels/submerged-village/houses/doorCount
   i32.lt_s
   if
    block $for-continue|1
     local.get $0
     local.get $4
     i32.const 2
     i32.shl
     local.tee $5
     global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
     i32.add
     i32.load
     i32.add
     local.tee $6
     local.get $2
     i32.const 1
     i32.sub
     i32.ge_s
     local.get $6
     i32.const 0
     i32.le_s
     i32.or
     local.get $1
     global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
     local.get $5
     i32.add
     i32.load
     i32.add
     local.tee $5
     i32.const 0
     i32.le_s
     i32.or
     local.get $5
     local.get $3
     i32.const 1
     i32.sub
     i32.ge_s
     i32.or
     br_if $for-continue|1
     global.get $assembly/generation-kernels/common/grid/GRID
     local.get $2
     local.get $5
     i32.mul
     local.get $6
     i32.add
     i32.const 2
     i32.shl
     i32.add
     i32.load
     i32.const 2
     i32.eq
     br_if $for-continue|1
     global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
     i32.const 0
     local.get $6
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
     i32.const 0
     local.get $5
     call $~lib/staticarray/StaticArray<i32>#__uset
     i32.const 1
     return
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|1
   end
  end
  i32.const 0
 )
 (func $assembly/generation-kernels/submerged-village/houses/tryPlaceHouseNear (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 f64)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=84
  local.set $9
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=4
  local.set $10
  local.get $0
  local.get $1
  local.get $0
  local.get $1
  i32.lt_s
  select
  f64.convert_i32_s
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=12
  f64.convert_i32_s
  f64.const 1e3
  f64.div
  f64.mul
  local.set $12
  loop $for-loop|0
   local.get $13
   i32.const 80
   i32.lt_s
   if
    global.get $assembly/generation-kernels/submerged-village/houses/POOL
    i32.const 0
    global.get $assembly/generation-kernels/submerged-village/houses/poolSize
    i32.const 1
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $14
    call $assembly/generation-kernels/submerged-village/houses/loadTemplate
    local.get $2
    call $assembly/generation-kernels/submerged-village/buffers/rng
    f64.const -0.5
    f64.add
    local.get $12
    f64.mul
    f64.floor
    i32.trunc_sat_f64_s
    i32.add
    local.set $7
    local.get $3
    call $assembly/generation-kernels/submerged-village/buffers/rng
    f64.const -0.5
    f64.add
    local.get $12
    f64.mul
    f64.floor
    i32.trunc_sat_f64_s
    i32.add
    local.set $8
    i32.const 0
    local.set $6
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $4
     global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
     i32.lt_s
     if
      block $for-break1
       local.get $9
       local.get $7
       local.get $4
       i32.const 2
       i32.shl
       local.tee $5
       global.get $assembly/generation-kernels/submerged-village/houses/TMPL_X
       i32.add
       i32.load
       i32.add
       local.tee $11
       i32.gt_s
       local.get $11
       local.get $0
       local.get $9
       i32.sub
       i32.ge_s
       i32.or
       local.get $9
       local.get $8
       global.get $assembly/generation-kernels/submerged-village/houses/TMPL_Y
       local.get $5
       i32.add
       i32.load
       i32.add
       local.tee $5
       i32.gt_s
       i32.or
       local.get $5
       local.get $1
       local.get $9
       i32.sub
       i32.ge_s
       i32.or
       if
        i32.const 1
        local.set $6
        br $for-break1
       end
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       br $for-loop|1
      end
     end
    end
    block $for-continue|0
     local.get $6
     br_if $for-continue|0
     i32.const 0
     local.set $4
     i32.const 0
     local.set $6
     loop $for-loop|2
      local.get $4
      i32.eqz
      local.get $6
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.lt_s
      i32.and
      if
       local.get $7
       local.get $6
       i32.const 2
       i32.shl
       local.tee $5
       global.get $assembly/generation-kernels/submerged-village/houses/TMPL_X
       i32.add
       i32.load
       i32.add
       local.set $15
       local.get $8
       global.get $assembly/generation-kernels/submerged-village/houses/TMPL_Y
       local.get $5
       i32.add
       i32.load
       i32.add
       local.set $16
       i32.const 0
       local.get $10
       i32.sub
       local.set $5
       loop $for-loop|3
        local.get $4
        i32.eqz
        local.get $5
        local.get $10
        i32.le_s
        i32.and
        if
         i32.const 0
         local.get $10
         i32.sub
         local.set $11
         loop $for-loop|4
          local.get $4
          i32.eqz
          local.get $10
          local.get $11
          i32.ge_s
          i32.and
          if
           i32.const 1
           local.get $4
           local.get $5
           local.get $15
           i32.add
           local.tee $17
           local.get $0
           i32.lt_s
           local.get $17
           i32.const 0
           i32.ge_s
           i32.and
           local.get $11
           local.get $16
           i32.add
           local.tee $4
           i32.const 0
           i32.ge_s
           i32.and
           local.get $1
           local.get $4
           i32.gt_s
           i32.and
           if (result i32)
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $4
            i32.mul
            local.get $17
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.const 2
            i32.eq
           else
            i32.const 0
           end
           select
           local.set $4
           local.get $11
           i32.const 1
           i32.add
           local.set $11
           br $for-loop|4
          end
         end
         local.get $5
         i32.const 1
         i32.add
         local.set $5
         br $for-loop|3
        end
       end
       local.get $6
       i32.const 1
       i32.add
       local.set $6
       br $for-loop|2
      end
     end
     local.get $4
     br_if $for-continue|0
     local.get $7
     local.get $8
     local.get $0
     local.get $1
     call $assembly/generation-kernels/submerged-village/houses/pickDoor
     i32.eqz
     br_if $for-continue|0
     global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
     local.set $1
     global.get $assembly/generation-kernels/submerged-village/buffers/totalHouseTiles
     local.set $3
     i32.const 0
     local.set $2
     loop $for-loop|5
      local.get $2
      global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
      i32.lt_s
      if
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $7
       local.get $2
       i32.const 2
       i32.shl
       local.tee $4
       global.get $assembly/generation-kernels/submerged-village/houses/TMPL_X
       i32.add
       i32.load
       i32.add
       local.tee $5
       local.get $8
       global.get $assembly/generation-kernels/submerged-village/houses/TMPL_Y
       local.get $4
       i32.add
       i32.load
       i32.add
       local.tee $4
       local.get $0
       i32.mul
       i32.add
       i32.const 2
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_X
       local.get $2
       local.get $3
       i32.add
       local.tee $6
       local.get $5
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_Y
       local.get $6
       local.get $4
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       br $for-loop|5
      end
     end
     global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_OX
     local.get $1
     local.get $7
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_OY
     local.get $1
     local.get $8
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
     local.get $1
     global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DX
     i32.load
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
     local.get $1
     global.get $assembly/generation-kernels/submerged-village/houses/DOOR_DY
     i32.load
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_SHAPE
     local.get $1
     local.get $14
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_START
     local.get $1
     local.get $3
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_COUNT
     local.get $1
     global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
     i32.const 1
     i32.add
     global.set $assembly/generation-kernels/submerged-village/buffers/houseCount
     global.get $assembly/generation-kernels/submerged-village/buffers/totalHouseTiles
     global.get $assembly/generation-kernels/submerged-village/houses/tmplTileCount
     i32.add
     global.set $assembly/generation-kernels/submerged-village/buffers/totalHouseTiles
     return
    end
    local.get $13
    i32.const 1
    i32.add
    local.set $13
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/houses/placeAllHouses (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 f64)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 f64)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 f64)
  (local $16 i32)
  i32.const 0
  global.set $assembly/generation-kernels/submerged-village/buffers/houseCount
  i32.const 0
  global.set $assembly/generation-kernels/submerged-village/buffers/totalHouseTiles
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=44
  drop
  i32.const 0
  global.set $assembly/generation-kernels/submerged-village/houses/poolSize
  global.get $assembly/generation-kernels/submerged-village/houses/POOL
  i32.const 0
  i32.const 0
  call $~lib/staticarray/StaticArray<i32>#__uset
  global.get $assembly/generation-kernels/submerged-village/houses/POOL
  i32.const 1
  i32.const 1
  call $~lib/staticarray/StaticArray<i32>#__uset
  i32.const 2
  global.set $assembly/generation-kernels/submerged-village/houses/poolSize
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=84
  local.set $8
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load
  local.set $10
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=8
  local.set $12
  local.get $0
  f64.convert_i32_s
  f64.const 0.5
  f64.mul
  local.set $4
  local.get $1
  f64.convert_i32_s
  f64.const 0.5
  f64.mul
  local.set $9
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=36
  local.tee $2
  i32.const 2147483647
  i32.ne
  if
   local.get $9
   global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
   i32.load offset=40
   f64.convert_i32_s
   f64.const 1e3
   f64.div
   local.get $1
   f64.convert_i32_s
   f64.mul
   f64.const 0.25
   f64.mul
   f64.add
   local.set $9
   local.get $4
   local.get $2
   f64.convert_i32_s
   f64.const 1e3
   f64.div
   local.get $0
   f64.convert_i32_s
   f64.mul
   f64.const 0.25
   f64.mul
   f64.add
   local.set $4
  end
  local.get $0
  local.get $1
  local.get $0
  local.get $1
  i32.lt_s
  select
  f64.convert_i32_s
  local.tee $15
  f64.const 0.35
  f64.mul
  i32.trunc_sat_f64_s
  local.set $13
  local.get $15
  f64.const 0.2
  f64.mul
  local.set $15
  loop $for-loop|0
   local.get $11
   i32.const 200
   i32.lt_s
   local.get $3
   local.get $12
   i32.lt_s
   i32.and
   if
    local.get $4
    call $assembly/generation-kernels/submerged-village/buffers/rng
    f64.const -0.5
    f64.add
    local.get $15
    f64.mul
    f64.add
    f64.floor
    i32.trunc_sat_f64_s
    local.set $5
    local.get $9
    call $assembly/generation-kernels/submerged-village/buffers/rng
    f64.const -0.5
    f64.add
    local.get $15
    f64.mul
    f64.add
    f64.floor
    i32.trunc_sat_f64_s
    local.set $6
    local.get $0
    local.get $8
    i32.sub
    i32.const 2
    i32.sub
    local.set $7
    block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.0
     local.get $5
     local.get $8
     i32.const 2
     i32.add
     local.tee $2
     i32.lt_s
     br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.0
     local.get $5
     local.get $7
     local.tee $2
     i32.gt_s
     br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.0
     local.get $5
     local.set $2
    end
    local.get $2
    local.set $5
    local.get $1
    local.get $8
    i32.sub
    i32.const 2
    i32.sub
    local.set $7
    block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.1
     local.get $6
     local.get $8
     i32.const 2
     i32.add
     local.tee $2
     i32.lt_s
     br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.1
     local.get $6
     local.get $7
     local.tee $2
     i32.gt_s
     br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.1
     local.get $6
     local.set $2
    end
    i32.const 0
    local.set $6
    i32.const 0
    local.set $7
    loop $for-loop|1
     local.get $3
     local.get $7
     i32.gt_s
     if
      block $for-break1
       i32.const 0
       local.get $7
       i32.const 2
       i32.shl
       local.tee $14
       global.get $assembly/generation-kernels/submerged-village/houses/CTR_X
       i32.add
       i32.load
       local.get $5
       i32.sub
       local.tee $16
       i32.sub
       local.get $16
       local.get $16
       i32.const 0
       i32.lt_s
       select
       i32.const 0
       global.get $assembly/generation-kernels/submerged-village/houses/CTR_Y
       local.get $14
       i32.add
       i32.load
       local.get $2
       i32.sub
       local.tee $14
       i32.sub
       local.get $14
       local.get $14
       i32.const 0
       i32.lt_s
       select
       i32.add
       local.get $13
       i32.lt_s
       if
        i32.const 1
        local.set $6
        br $for-break1
       end
       local.get $7
       i32.const 1
       i32.add
       local.set $7
       br $for-loop|1
      end
     end
    end
    local.get $6
    i32.eqz
    if
     global.get $assembly/generation-kernels/submerged-village/houses/CTR_X
     local.get $3
     local.get $5
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/houses/CTR_Y
     local.get $3
     local.get $2
     call $~lib/staticarray/StaticArray<i32>#__uset
     local.get $3
     i32.const 1
     i32.add
     local.set $3
    end
    local.get $11
    i32.const 1
    i32.add
    local.set $11
    br $for-loop|0
   end
  end
  local.get $3
  i32.eqz
  if
   global.get $assembly/generation-kernels/submerged-village/houses/CTR_X
   local.set $6
   local.get $0
   local.get $8
   i32.sub
   i32.const 2
   i32.sub
   local.set $3
   block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.2
    local.get $8
    i32.const 2
    i32.add
    local.tee $2
    local.get $4
    f64.floor
    i32.trunc_sat_f64_s
    local.tee $5
    i32.gt_s
    br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.2
    local.get $5
    local.get $3
    local.tee $2
    i32.gt_s
    br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.2
    local.get $5
    local.set $2
   end
   local.get $6
   i32.const 0
   local.get $2
   call $~lib/staticarray/StaticArray<i32>#__uset
   global.get $assembly/generation-kernels/submerged-village/houses/CTR_Y
   local.set $6
   local.get $1
   local.get $8
   i32.sub
   i32.const 2
   i32.sub
   local.set $3
   block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.3
    local.get $8
    i32.const 2
    i32.add
    local.tee $2
    local.get $9
    f64.floor
    i32.trunc_sat_f64_s
    local.tee $5
    i32.gt_s
    br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.3
    local.get $5
    local.get $3
    local.tee $2
    i32.gt_s
    br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.3
    local.get $5
    local.set $2
   end
   local.get $6
   i32.const 0
   local.get $2
   call $~lib/staticarray/StaticArray<i32>#__uset
   i32.const 1
   local.set $3
  end
  i32.const 1
  local.get $3
  local.get $10
  i32.add
  i32.const 1
  i32.sub
  local.get $3
  i32.div_s
  local.tee $2
  local.get $2
  i32.const 0
  i32.le_s
  select
  local.set $5
  i32.const 0
  local.set $2
  loop $for-loop|2
   local.get $2
   local.get $3
   i32.lt_s
   if
    i32.const 0
    local.set $6
    loop $for-loop|3
     global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
     local.get $10
     i32.lt_s
     local.get $5
     local.get $6
     i32.gt_s
     i32.and
     if
      local.get $0
      local.get $1
      local.get $2
      i32.const 2
      i32.shl
      local.tee $7
      global.get $assembly/generation-kernels/submerged-village/houses/CTR_X
      i32.add
      i32.load
      global.get $assembly/generation-kernels/submerged-village/houses/CTR_Y
      local.get $7
      i32.add
      i32.load
      call $assembly/generation-kernels/submerged-village/houses/tryPlaceHouseNear
      local.get $6
      i32.const 1
      i32.add
      local.set $6
      br $for-loop|3
     end
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|2
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/buffers/clearBitmap (param $0 i32) (param $1 i32)
  (local $2 i32)
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    local.get $0
    local.get $2
    i32.add
    i32.const 0
    i32.store8
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/houses/clearAroundHouses (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
  i32.eqz
  local.get $2
  i32.const 0
  i32.le_s
  i32.or
  if
   return
  end
  global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
  local.get $0
  local.get $1
  i32.mul
  call $assembly/generation-kernels/submerged-village/buffers/clearBitmap
  loop $for-loop|0
   local.get $3
   global.get $assembly/generation-kernels/submerged-village/buffers/totalHouseTiles
   i32.lt_s
   if
    global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
    local.get $0
    local.get $3
    i32.const 2
    i32.shl
    local.tee $4
    global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_Y
    i32.add
    i32.load
    i32.mul
    global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_X
    local.get $4
    i32.add
    i32.load
    i32.add
    i32.add
    i32.const 1
    i32.store8
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  i32.const 0
  local.set $3
  loop $for-loop|1
   local.get $1
   local.get $3
   i32.gt_s
   if
    i32.const 0
    local.set $4
    loop $for-loop|2
     local.get $0
     local.get $4
     i32.gt_s
     if
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $3
      i32.mul
      local.get $4
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.const 1
      i32.eq
      if
       i32.const 0
       local.set $5
       i32.const 0
       local.get $2
       i32.sub
       local.set $6
       loop $for-loop|3
        local.get $5
        i32.eqz
        local.get $2
        local.get $6
        i32.ge_s
        i32.and
        if
         i32.const 0
         local.get $2
         i32.sub
         local.set $7
         loop $for-loop|4
          local.get $5
          i32.eqz
          local.get $2
          local.get $7
          i32.ge_s
          i32.and
          if
           i32.const 1
           local.get $5
           local.get $4
           local.get $7
           i32.add
           local.tee $5
           local.get $0
           i32.lt_s
           local.get $5
           i32.const 0
           i32.ge_s
           i32.and
           local.get $3
           local.get $6
           i32.add
           local.tee $8
           i32.const 0
           i32.ge_s
           i32.and
           local.get $1
           local.get $8
           i32.gt_s
           i32.and
           if (result i32)
            global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
            local.get $0
            local.get $8
            i32.mul
            local.get $5
            i32.add
            i32.add
            i32.load8_u
            i32.const 1
            i32.eq
           else
            i32.const 0
           end
           select
           local.set $5
           local.get $7
           i32.const 1
           i32.add
           local.set $7
           br $for-loop|4
          end
         end
         local.get $6
         i32.const 1
         i32.add
         local.set $6
         br $for-loop|3
        end
       end
       local.get $5
       if
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $3
        i32.mul
        local.get $4
        i32.add
        i32.const 0
        call $~lib/staticarray/StaticArray<i32>#__uset
       end
      end
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|2
     end
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|1
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/houses/growVillageGround (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
  i32.eqz
  local.get $2
  i32.const 0
  i32.le_s
  i32.or
  if
   return
  end
  loop $for-loop|0
   local.get $8
   global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
   i32.lt_s
   if
    local.get $8
    i32.const 2
    i32.shl
    local.tee $3
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_START
    i32.add
    i32.load
    local.set $4
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_COUNT
    local.get $3
    i32.add
    i32.load
    local.set $6
    i32.const 0
    local.set $3
    i32.const 0
    local.set $7
    i32.const 0
    local.set $5
    loop $for-loop|1
     local.get $5
     local.get $6
     i32.lt_s
     if
      local.get $3
      local.get $4
      local.get $5
      i32.add
      i32.const 2
      i32.shl
      local.tee $9
      global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_X
      i32.add
      i32.load
      i32.add
      local.set $3
      local.get $7
      global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_Y
      local.get $9
      i32.add
      i32.load
      i32.add
      local.set $7
      local.get $5
      i32.const 1
      i32.add
      local.set $5
      br $for-loop|1
     end
    end
    local.get $6
    i32.const 1
    i32.shr_s
    local.tee $4
    local.get $3
    i32.add
    local.get $6
    i32.div_s
    local.set $9
    local.get $4
    local.get $7
    i32.add
    local.get $6
    i32.div_s
    local.set $10
    call $assembly/generation-kernels/submerged-village/buffers/rng
    f64.const 3
    f64.mul
    f64.floor
    i32.trunc_sat_f64_s
    i32.const 1
    i32.add
    local.set $11
    i32.const 0
    local.set $7
    loop $for-loop|2
     local.get $7
     local.get $11
     i32.lt_s
     if
      local.get $0
      i32.const 2
      i32.sub
      local.set $4
      i32.const 1
      local.set $3
      block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.4
       i32.const 0
       local.get $2
       i32.sub
       local.get $2
       call $assembly/generation-kernels/submerged-village/buffers/rngInt
       local.get $9
       i32.add
       local.tee $5
       i32.const 0
       i32.le_s
       br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.4
       local.get $5
       local.get $4
       local.tee $3
       i32.gt_s
       br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.4
       local.get $5
       local.set $3
      end
      local.get $3
      local.set $4
      local.get $1
      i32.const 2
      i32.sub
      local.set $5
      i32.const 1
      local.set $3
      block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.5
       i32.const 0
       local.get $2
       i32.sub
       local.get $2
       call $assembly/generation-kernels/submerged-village/buffers/rngInt
       local.get $10
       i32.add
       local.tee $6
       i32.const 0
       i32.le_s
       br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.5
       local.get $6
       local.get $5
       local.tee $3
       i32.gt_s
       br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.5
       local.get $6
       local.set $3
      end
      i32.const 1
      call $assembly/generation-kernels/submerged-village/buffers/rng
      local.get $2
      f64.convert_i32_s
      f64.mul
      f64.floor
      i32.trunc_sat_f64_s
      i32.const 1
      i32.add
      local.tee $5
      local.get $5
      i32.const 0
      i32.le_s
      select
      local.set $13
      local.get $3
      i32.const 1
      call $assembly/generation-kernels/submerged-village/buffers/rng
      local.get $2
      f64.convert_i32_s
      f64.mul
      f64.floor
      i32.trunc_sat_f64_s
      i32.const 1
      i32.add
      local.tee $5
      local.get $5
      i32.const 0
      i32.le_s
      select
      local.tee $14
      i32.sub
      i32.const 1
      i32.sub
      local.set $6
      loop $for-loop|3
       local.get $6
       local.get $3
       local.get $14
       i32.add
       i32.const 1
       i32.add
       i32.le_s
       if
        local.get $4
        local.get $13
        i32.sub
        i32.const 1
        i32.sub
        local.set $5
        loop $for-loop|4
         local.get $5
         local.get $4
         local.get $13
         i32.add
         i32.const 1
         i32.add
         i32.le_s
         if
          block $for-continue|4
           local.get $5
           i32.const 0
           i32.le_s
           local.get $5
           local.get $0
           i32.const 1
           i32.sub
           i32.ge_s
           i32.or
           local.get $6
           i32.const 0
           i32.le_s
           i32.or
           local.get $6
           local.get $1
           i32.const 1
           i32.sub
           i32.ge_s
           i32.or
           br_if $for-continue|4
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $6
           i32.mul
           local.get $5
           i32.add
           local.tee $12
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.const 2
           i32.eq
           br_if $for-continue|4
           i32.const 0
           local.get $5
           local.get $4
           i32.sub
           local.tee $15
           i32.sub
           local.get $15
           local.get $15
           i32.const 0
           i32.lt_s
           select
           f64.convert_i32_s
           i32.const 1
           local.get $13
           local.get $13
           i32.const 0
           i32.le_s
           select
           f64.convert_i32_s
           f64.div
           i32.const 0
           local.get $6
           local.get $3
           i32.sub
           local.tee $15
           i32.sub
           local.get $15
           local.get $15
           i32.const 0
           i32.lt_s
           select
           f64.convert_i32_s
           i32.const 1
           local.get $14
           local.get $14
           i32.const 0
           i32.le_s
           select
           f64.convert_i32_s
           f64.div
           f64.add
           call $assembly/generation-kernels/submerged-village/buffers/rng
           f64.const 0.45
           f64.mul
           f64.const 1.05
           f64.add
           f64.le
           if
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $12
            i32.const 0
            call $~lib/staticarray/StaticArray<i32>#__uset
           end
          end
          local.get $5
          i32.const 1
          i32.add
          local.set $5
          br $for-loop|4
         end
        end
        local.get $6
        i32.const 1
        i32.add
        local.set $6
        br $for-loop|3
       end
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $for-loop|2
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/houses/placeFences (param $0 i32) (param $1 i32) (param $2 f64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 f64)
  (local $15 f64)
  (local $16 i32)
  (local $17 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
  i32.eqz
  local.get $2
  f64.const 0
  f64.le
  i32.or
  if
   return
  end
  loop $for-loop|0
   local.get $8
   global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
   i32.lt_s
   if
    call $assembly/generation-kernels/submerged-village/buffers/rng
    local.get $2
    f64.lt
    if (result i32)
     i32.const 2
     i32.const 1
     call $assembly/generation-kernels/submerged-village/buffers/rng
     f64.const 0.4
     f64.lt
     select
    else
     i32.const 0
    end
    local.set $13
    local.get $8
    i32.const 2
    i32.shl
    local.tee $3
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_START
    i32.add
    i32.load
    local.set $10
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_COUNT
    local.get $3
    i32.add
    i32.load
    local.set $6
    i32.const 0
    local.set $9
    loop $for-loop|1
     local.get $9
     local.get $13
     i32.lt_s
     if
      i32.const 0
      local.set $3
      i32.const 0
      local.set $4
      loop $for-loop|2
       local.get $4
       local.get $6
       i32.lt_s
       if
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $4
        local.get $10
        i32.add
        i32.const 2
        i32.shl
        local.tee $5
        global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_X
        i32.add
        i32.load
        local.tee $7
        i32.const 1
        i32.sub
        global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_Y
        local.get $5
        i32.add
        i32.load
        local.tee $5
        local.get $0
        i32.mul
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
        i32.const 2
        i32.ne
        if (result i32)
         i32.const 1
        else
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $7
         i32.const 1
         i32.add
         local.get $0
         local.get $5
         i32.mul
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         i32.const 2
         i32.ne
        end
        if (result i32)
         i32.const 1
        else
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $5
         i32.const 1
         i32.sub
         i32.mul
         local.get $7
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         i32.const 2
         i32.ne
        end
        if (result i32)
         i32.const 1
        else
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $5
         i32.const 1
         i32.add
         i32.mul
         local.get $7
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         i32.const 2
         i32.ne
        end
        if
         global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
         local.get $3
         local.get $7
         call $~lib/staticarray/StaticArray<i32>#__uset
         global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
         local.get $3
         local.get $5
         call $~lib/staticarray/StaticArray<i32>#__uset
         local.get $3
         i32.const 1
         i32.add
         local.set $3
        end
        local.get $4
        i32.const 1
        i32.add
        local.set $4
        br $for-loop|2
       end
      end
      local.get $3
      if
       i32.const 0
       local.get $3
       i32.const 1
       i32.sub
       call $assembly/generation-kernels/submerged-village/buffers/rngInt
       i32.const 2
       i32.shl
       local.tee $3
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
       i32.add
       i32.load
       local.set $16
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
       local.get $3
       i32.add
       i32.load
       local.set $11
       i32.const 0
       local.set $4
       i32.const 0
       local.set $5
       i32.const 0
       local.set $3
       loop $for-loop|3
        local.get $3
        local.get $6
        i32.lt_s
        if
         local.get $4
         local.get $3
         local.get $10
         i32.add
         i32.const 2
         i32.shl
         local.tee $7
         global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_X
         i32.add
         i32.load
         i32.add
         local.set $4
         local.get $5
         global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_Y
         local.get $7
         i32.add
         i32.load
         i32.add
         local.set $5
         local.get $3
         i32.const 1
         i32.add
         local.set $3
         br $for-loop|3
        end
       end
       i32.const 0
       local.set $7
       i32.const 0
       local.set $12
       local.get $16
       f64.convert_i32_s
       local.get $4
       f64.convert_i32_s
       local.get $6
       f64.convert_i32_s
       f64.div
       f64.sub
       local.tee $14
       f64.abs
       local.get $11
       f64.convert_i32_s
       local.get $5
       f64.convert_i32_s
       local.get $6
       f64.convert_i32_s
       f64.div
       f64.sub
       local.tee $15
       f64.abs
       f64.ge
       if
        i32.const 1
        i32.const -1
        local.get $14
        f64.const 0
        f64.gt
        select
        local.set $7
       else
        i32.const 1
        i32.const -1
        local.get $15
        f64.const 0
        f64.gt
        select
        local.set $12
       end
       i32.const 0
       i32.const 2
       call $assembly/generation-kernels/submerged-village/buffers/rngInt
       i32.const 2
       i32.add
       local.set $4
       i32.const 1
       local.set $3
       loop $for-loop|4
        local.get $3
        local.get $4
        i32.le_s
        if
         block $for-break4
          local.get $16
          local.get $3
          local.get $7
          i32.mul
          i32.add
          local.tee $5
          local.get $0
          i32.const 1
          i32.sub
          i32.ge_s
          local.get $5
          i32.const 0
          i32.le_s
          i32.or
          local.get $11
          local.get $3
          local.get $12
          i32.mul
          i32.add
          local.tee $17
          i32.const 0
          i32.le_s
          i32.or
          local.get $17
          local.get $1
          i32.const 1
          i32.sub
          i32.ge_s
          i32.or
          br_if $for-break4
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $0
          local.get $17
          i32.mul
          local.get $5
          i32.add
          local.tee $5
          i32.const 2
          i32.shl
          i32.add
          i32.load
          local.tee $17
          i32.eqz
          local.get $17
          i32.const 2
          i32.eq
          i32.or
          br_if $for-break4
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $5
          i32.const 3
          call $~lib/staticarray/StaticArray<i32>#__uset
          local.get $3
          i32.const 1
          i32.add
          local.set $3
          br $for-loop|4
         end
        end
       end
      end
      local.get $9
      i32.const 1
      i32.add
      local.set $9
      br $for-loop|1
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/roads/carveDoorStubs (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  local.get $2
  i32.const 0
  i32.le_s
  if
   return
  end
  loop $for-loop|0
   local.get $6
   global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
   i32.lt_s
   if
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $6
    i32.const 2
    i32.shl
    local.tee $3
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
    i32.add
    i32.load
    local.tee $4
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
    local.get $3
    i32.add
    i32.load
    local.tee $5
    local.get $0
    i32.mul
    i32.add
    i32.const 0
    call $~lib/staticarray/StaticArray<i32>#__uset
    i32.const 0
    local.set $7
    i32.const 0
    local.set $8
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_START
    local.get $3
    i32.add
    i32.load
    local.set $9
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_COUNT
    local.get $3
    i32.add
    i32.load
    local.set $10
    i32.const 0
    local.set $3
    loop $for-loop|1
     local.get $3
     local.get $10
     i32.lt_s
     if
      block $for-break1
       i32.const 0
       local.get $3
       local.get $9
       i32.add
       i32.const 2
       i32.shl
       local.tee $12
       global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_X
       i32.add
       i32.load
       local.tee $11
       local.get $4
       i32.sub
       local.tee $13
       i32.sub
       local.get $13
       local.get $13
       i32.const 0
       i32.lt_s
       select
       i32.const 0
       global.get $assembly/generation-kernels/submerged-village/buffers/HTILES_Y
       local.get $12
       i32.add
       i32.load
       local.tee $12
       local.get $5
       i32.sub
       local.tee $13
       i32.sub
       local.get $13
       local.get $13
       i32.const 0
       i32.lt_s
       select
       i32.add
       i32.const 1
       i32.eq
       if
        local.get $4
        local.get $11
        i32.sub
        local.set $7
        local.get $5
        local.get $12
        i32.sub
        local.set $8
        br $for-break1
       end
       local.get $3
       i32.const 1
       i32.add
       local.set $3
       br $for-loop|1
      end
     end
    end
    i32.const 0
    local.set $3
    loop $for-loop|2
     local.get $2
     local.get $3
     i32.gt_s
     if
      local.get $4
      local.get $7
      i32.add
      local.tee $4
      local.get $0
      i32.lt_s
      local.get $4
      i32.const 0
      i32.ge_s
      i32.and
      local.get $5
      local.get $8
      i32.add
      local.tee $5
      i32.const 0
      i32.ge_s
      i32.and
      local.get $1
      local.get $5
      i32.gt_s
      i32.and
      if (result i32)
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 2
       i32.eq
      else
       i32.const 1
      end
      i32.eqz
      if
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $5
       i32.mul
       local.get $4
       i32.add
       i32.const 0
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $3
       i32.const 1
       i32.add
       local.set $3
       br $for-loop|2
      end
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/roads/carveRoad (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32) (param $5 i32) (result i32)
  local.get $0
  local.get $1
  local.get $2
  local.get $3
  local.get $4
  local.get $5
  i32.const 2
  i32.const 0
  i32.const 3
  i32.const 1200
  i32.const 800
  i32.const 1500
  i32.const 30
  call $assembly/generation-kernels/submerged-village/find-road-astar/findRoadPathAStar
  local.tee $2
  i32.const 0
  i32.le_s
  if
   i32.const 0
   return
  end
  i32.const 0
  local.set $1
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.lt_s
   if
    global.get $assembly/generation-kernels/common/grid/GRID
    global.get $assembly/generation-kernels/common/grid/PATH_BUF
    local.get $1
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $3
    local.get $0
    i32.rem_s
    local.get $3
    local.get $0
    i32.div_s
    local.get $0
    i32.mul
    i32.add
    local.tee $3
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.const 2
    i32.ne
    if
     global.get $assembly/generation-kernels/common/grid/GRID
     local.get $3
     i32.const 0
     call $~lib/staticarray/StaticArray<i32>#__uset
    end
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|0
   end
  end
  i32.const 1
 )
 (func $assembly/generation-kernels/submerged-village/roads/buildGraphAndCarve (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=48
  local.tee $2
  global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
  i32.const 1
  i32.sub
  local.tee $3
  local.get $2
  local.get $3
  i32.lt_s
  select
  local.tee $10
  i32.const 0
  i32.le_s
  if
   return
  end
  i32.const 0
  global.set $assembly/generation-kernels/submerged-village/roads/edgeCount
  loop $for-loop|0
   local.get $7
   global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
   i32.lt_s
   if
    local.get $7
    i32.const 2
    i32.shl
    local.tee $2
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
    i32.add
    i32.load
    local.set $11
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
    local.get $2
    i32.add
    i32.load
    local.set $12
    i32.const 0
    local.set $8
    loop $for-loop|1
     local.get $8
     local.get $10
     i32.lt_s
     if
      i32.const -1
      local.set $2
      i32.const 99999
      local.set $3
      i32.const 0
      local.set $5
      loop $for-loop|2
       local.get $5
       global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
       i32.lt_s
       if
        block $for-continue|2
         local.get $5
         local.get $7
         i32.eq
         br_if $for-continue|2
         i32.const 0
         local.get $11
         local.get $5
         i32.const 2
         i32.shl
         local.tee $4
         global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
         i32.add
         i32.load
         i32.sub
         local.tee $6
         i32.sub
         local.get $6
         local.get $6
         i32.const 0
         i32.lt_s
         select
         i32.const 0
         local.get $12
         global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
         local.get $4
         i32.add
         i32.load
         i32.sub
         local.tee $4
         i32.sub
         local.get $4
         local.get $4
         i32.const 0
         i32.lt_s
         select
         i32.add
         local.set $4
         i32.const 0
         local.set $9
         i32.const 0
         local.set $6
         loop $for-loop|3
          local.get $6
          global.get $assembly/generation-kernels/submerged-village/roads/edgeCount
          i32.lt_s
          if
           block $for-break3
            local.get $7
            local.get $6
            i32.const 2
            i32.shl
            local.tee $13
            global.get $assembly/generation-kernels/submerged-village/roads/EDGE_A
            i32.add
            i32.load
            i32.eq
            if (result i32)
             local.get $5
             global.get $assembly/generation-kernels/submerged-village/roads/EDGE_B
             local.get $13
             i32.add
             i32.load
             i32.eq
            else
             i32.const 0
            end
            if (result i32)
             i32.const 1
            else
             local.get $5
             local.get $6
             i32.const 2
             i32.shl
             local.tee $13
             global.get $assembly/generation-kernels/submerged-village/roads/EDGE_A
             i32.add
             i32.load
             i32.eq
             if (result i32)
              local.get $7
              global.get $assembly/generation-kernels/submerged-village/roads/EDGE_B
              local.get $13
              i32.add
              i32.load
              i32.eq
             else
              i32.const 0
             end
            end
            if
             i32.const 1
             local.set $9
             br $for-break3
            end
            local.get $6
            i32.const 1
            i32.add
            local.set $6
            br $for-loop|3
           end
          end
         end
         local.get $9
         br_if $for-continue|2
         local.get $3
         local.get $4
         i32.gt_s
         if
          local.get $4
          local.set $3
          local.get $5
          local.set $2
         end
        end
        local.get $5
        i32.const 1
        i32.add
        local.set $5
        br $for-loop|2
       end
      end
      global.get $assembly/generation-kernels/submerged-village/roads/edgeCount
      i32.const 128
      i32.lt_s
      local.get $2
      i32.const 0
      i32.ge_s
      i32.and
      if
       global.get $assembly/generation-kernels/submerged-village/roads/EDGE_A
       global.get $assembly/generation-kernels/submerged-village/roads/edgeCount
       local.get $7
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/submerged-village/roads/EDGE_B
       global.get $assembly/generation-kernels/submerged-village/roads/edgeCount
       local.get $2
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/submerged-village/roads/EDGE_D
       global.get $assembly/generation-kernels/submerged-village/roads/edgeCount
       local.get $3
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/submerged-village/roads/edgeCount
       i32.const 1
       i32.add
       global.set $assembly/generation-kernels/submerged-village/roads/edgeCount
      end
      local.get $8
      i32.const 1
      i32.add
      local.set $8
      br $for-loop|1
     end
    end
    local.get $7
    i32.const 1
    i32.add
    local.set $7
    br $for-loop|0
   end
  end
  i32.const 1
  local.set $5
  loop $for-loop|4
   local.get $5
   global.get $assembly/generation-kernels/submerged-village/roads/edgeCount
   i32.lt_s
   if
    local.get $5
    i32.const 2
    i32.shl
    local.tee $2
    global.get $assembly/generation-kernels/submerged-village/roads/EDGE_D
    i32.add
    i32.load
    local.set $3
    global.get $assembly/generation-kernels/submerged-village/roads/EDGE_A
    local.get $2
    i32.add
    i32.load
    local.set $4
    global.get $assembly/generation-kernels/submerged-village/roads/EDGE_B
    local.get $2
    i32.add
    i32.load
    local.set $6
    local.get $5
    i32.const 1
    i32.sub
    local.set $2
    loop $while-continue|5
     local.get $2
     i32.const 0
     i32.ge_s
     if (result i32)
      local.get $3
      global.get $assembly/generation-kernels/submerged-village/roads/EDGE_D
      local.get $2
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.lt_s
     else
      i32.const 0
     end
     if
      global.get $assembly/generation-kernels/submerged-village/roads/EDGE_D
      local.get $2
      i32.const 1
      i32.add
      local.tee $7
      local.get $2
      i32.const 2
      i32.shl
      local.tee $8
      global.get $assembly/generation-kernels/submerged-village/roads/EDGE_D
      i32.add
      i32.load
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/roads/EDGE_A
      local.get $7
      global.get $assembly/generation-kernels/submerged-village/roads/EDGE_A
      local.get $8
      i32.add
      i32.load
      call $~lib/staticarray/StaticArray<i32>#__uset
      global.get $assembly/generation-kernels/submerged-village/roads/EDGE_B
      local.get $7
      global.get $assembly/generation-kernels/submerged-village/roads/EDGE_B
      local.get $8
      i32.add
      i32.load
      call $~lib/staticarray/StaticArray<i32>#__uset
      local.get $2
      i32.const 1
      i32.sub
      local.set $2
      br $while-continue|5
     end
    end
    global.get $assembly/generation-kernels/submerged-village/roads/EDGE_D
    local.get $2
    i32.const 1
    i32.add
    local.tee $2
    local.get $3
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/roads/EDGE_A
    local.get $2
    local.get $4
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/submerged-village/roads/EDGE_B
    local.get $2
    local.get $6
    call $~lib/staticarray/StaticArray<i32>#__uset
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|4
   end
  end
  i32.const 0
  local.set $2
  loop $for-loop|6
   local.get $2
   global.get $assembly/generation-kernels/submerged-village/roads/edgeCount
   i32.lt_s
   if
    local.get $2
    i32.const 2
    i32.shl
    local.tee $3
    global.get $assembly/generation-kernels/submerged-village/roads/EDGE_A
    i32.add
    i32.load
    local.set $4
    global.get $assembly/generation-kernels/submerged-village/roads/EDGE_B
    local.get $3
    i32.add
    i32.load
    local.set $3
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $4
    i32.const 2
    i32.shl
    local.tee $4
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
    i32.add
    i32.load
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
    local.get $4
    i32.add
    i32.load
    local.get $0
    i32.mul
    i32.add
    i32.const 0
    call $~lib/staticarray/StaticArray<i32>#__uset
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $3
    i32.const 2
    i32.shl
    local.tee $3
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
    i32.add
    i32.load
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
    local.get $3
    i32.add
    i32.load
    local.get $0
    i32.mul
    i32.add
    i32.const 0
    call $~lib/staticarray/StaticArray<i32>#__uset
    local.get $0
    local.get $1
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
    local.get $4
    i32.add
    i32.load
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
    local.get $4
    i32.add
    i32.load
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
    local.get $3
    i32.add
    i32.load
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
    local.get $3
    i32.add
    i32.load
    call $assembly/generation-kernels/submerged-village/roads/carveRoad
    drop
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|6
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/roads/findNearestPath (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (result i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  i32.const 99999
  local.set $7
  i32.const -1
  local.set $4
  i32.const -1
  local.set $6
  loop $for-loop|0
   local.get $1
   local.get $8
   i32.gt_s
   if
    i32.const 0
    local.set $9
    loop $for-loop|1
     local.get $0
     local.get $9
     i32.gt_s
     if
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $8
      i32.mul
      local.get $9
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.eqz
      if
       i32.const 0
       local.get $9
       local.get $2
       i32.sub
       local.tee $5
       i32.sub
       local.get $5
       local.get $5
       i32.const 0
       i32.lt_s
       select
       i32.const 0
       local.get $8
       local.get $3
       i32.sub
       local.tee $5
       i32.sub
       local.get $5
       local.get $5
       i32.const 0
       i32.lt_s
       select
       i32.add
       local.tee $5
       local.get $7
       i32.lt_s
       if
        local.get $5
        local.set $7
        local.get $8
        local.set $6
        local.get $9
        local.set $4
       end
      end
      local.get $9
      i32.const 1
      i32.add
      local.set $9
      br $for-loop|1
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
  local.get $4
  i32.const 0
  i32.lt_s
  if
   i32.const -1
   return
  end
  local.get $4
  local.get $6
  i32.const 16
  i32.shl
  i32.or
 )
 (func $assembly/generation-kernels/submerged-village/roads/ensureBorderAccess (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  (local $19 i32)
  i32.const 1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.const -64
  i32.sub
  i32.load
  local.tee $2
  local.get $2
  i32.const 0
  i32.le_s
  select
  local.set $18
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=56
  local.set $9
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=60
  local.set $11
  local.get $0
  i32.const 1
  i32.shr_s
  local.set $14
  local.get $1
  i32.const 1
  i32.shr_s
  local.set $19
  loop $for-loop|0
   local.get $15
   local.get $18
   i32.lt_s
   if
    i32.const 0
    local.set $8
    loop $for-loop|1
     local.get $8
     i32.const 4
     i32.lt_s
     if
      local.get $8
      if
       local.get $8
       i32.const 1
       i32.eq
       if
        local.get $0
        i32.const 2
        i32.sub
        local.set $3
        i32.const 1
        local.set $2
        block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.7
         i32.const 0
         local.get $9
         i32.sub
         local.get $9
         call $assembly/generation-kernels/submerged-village/buffers/rngInt
         local.get $14
         i32.add
         local.tee $4
         i32.const 0
         i32.le_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.7
         local.get $4
         local.get $3
         local.tee $2
         i32.gt_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.7
         local.get $4
         local.set $2
        end
        local.get $2
        local.set $4
        local.get $1
        i32.const 1
        i32.sub
        local.set $2
       else
        local.get $0
        i32.const 1
        i32.sub
        i32.const 0
        local.get $8
        i32.const 2
        i32.ne
        select
        local.set $4
        local.get $1
        i32.const 2
        i32.sub
        local.set $3
        i32.const 1
        local.set $2
        block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.8
         i32.const 0
         local.get $9
         i32.sub
         local.get $9
         call $assembly/generation-kernels/submerged-village/buffers/rngInt
         local.get $19
         i32.add
         local.tee $5
         i32.const 0
         i32.le_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.8
         local.get $5
         local.get $3
         local.tee $2
         i32.gt_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.8
         local.get $5
         local.set $2
        end
       end
      else
       local.get $0
       i32.const 2
       i32.sub
       local.set $3
       i32.const 1
       local.set $2
       block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.6
        i32.const 0
        local.get $9
        i32.sub
        local.get $9
        call $assembly/generation-kernels/submerged-village/buffers/rngInt
        local.get $14
        i32.add
        local.tee $4
        i32.const 0
        i32.le_s
        br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.6
        local.get $4
        local.get $3
        local.tee $2
        i32.gt_s
        br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.6
        local.get $4
        local.set $2
       end
       local.get $2
       local.set $4
       i32.const 0
       local.set $2
      end
      local.get $0
      local.get $1
      local.get $4
      local.get $2
      local.tee $5
      call $assembly/generation-kernels/submerged-village/roads/findNearestPath
      local.tee $2
      i32.const 0
      i32.ge_s
      if
       local.get $2
       i32.const 65535
       i32.and
       local.set $12
       local.get $2
       i32.const 16
       i32.shr_s
       i32.const 65535
       i32.and
       local.set $13
       local.get $8
       i32.const 2
       i32.lt_s
       if
        local.get $0
        i32.const 2
        i32.sub
        local.set $3
        i32.const 1
        local.set $2
        block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.10
         i32.const 0
         local.get $11
         i32.sub
         local.get $11
         call $assembly/generation-kernels/submerged-village/buffers/rngInt
         local.get $12
         i32.add
         local.tee $6
         i32.const 0
         i32.le_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.10
         local.get $6
         local.get $3
         local.tee $2
         i32.gt_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.10
         local.get $6
         local.set $2
        end
        local.get $2
        local.set $3
        local.get $1
        i32.const 2
        i32.sub
        local.set $6
        i32.const 1
        local.set $2
        block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.11
         local.get $5
         local.get $13
         i32.add
         i32.const 1
         i32.shr_s
         local.tee $7
         i32.const 0
         i32.le_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.11
         local.get $7
         local.get $6
         local.tee $2
         i32.gt_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.11
         local.get $7
         local.set $2
        end
       else
        local.get $0
        i32.const 2
        i32.sub
        local.set $3
        i32.const 1
        local.set $2
        block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.12
         local.get $4
         local.get $12
         i32.add
         i32.const 1
         i32.shr_s
         local.tee $6
         i32.const 0
         i32.le_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.12
         local.get $6
         local.get $3
         local.tee $2
         i32.gt_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.12
         local.get $6
         local.set $2
        end
        local.get $2
        local.set $3
        local.get $1
        i32.const 2
        i32.sub
        local.set $6
        i32.const 1
        local.set $2
        block $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.13
         i32.const 0
         local.get $11
         i32.sub
         local.get $11
         call $assembly/generation-kernels/submerged-village/buffers/rngInt
         local.get $13
         i32.add
         local.tee $7
         i32.const 0
         i32.le_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.13
         local.get $7
         local.get $6
         local.tee $2
         i32.gt_s
         br_if $assembly/generation-kernels/submerged-village/buffers/clampI|inlined.13
         local.get $7
         local.set $2
        end
       end
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $2
       i32.mul
       local.get $3
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 2
       i32.eq
       if
        i32.const 1
        local.set $6
        loop $for-loop|2
         local.get $6
         i32.const 3
         i32.le_s
         if
          i32.const 0
          local.get $6
          i32.sub
          local.set $7
          loop $for-loop|3
           local.get $6
           local.get $7
           i32.ge_s
           if
            i32.const 0
            local.get $6
            i32.sub
            local.set $10
            loop $for-loop|4
             local.get $6
             local.get $10
             i32.ge_s
             if
              block $for-break4
               local.get $3
               local.get $10
               i32.add
               local.tee $16
               local.get $0
               i32.lt_s
               local.get $16
               i32.const 0
               i32.ge_s
               i32.and
               local.get $2
               local.get $7
               i32.add
               local.tee $17
               i32.const 0
               i32.ge_s
               i32.and
               local.get $1
               local.get $17
               i32.gt_s
               i32.and
               if (result i32)
                global.get $assembly/generation-kernels/common/grid/GRID
                local.get $0
                local.get $17
                i32.mul
                local.get $16
                i32.add
                i32.const 2
                i32.shl
                i32.add
                i32.load
                i32.const 2
                i32.ne
               else
                i32.const 0
               end
               if
                local.get $3
                local.get $10
                i32.add
                local.set $3
                local.get $2
                local.get $7
                i32.add
                local.set $2
                i32.const 4
                local.set $6
                i32.const 4
                local.set $7
                br $for-break4
               end
               local.get $10
               i32.const 1
               i32.add
               local.set $10
               br $for-loop|4
              end
             end
            end
            local.get $7
            i32.const 1
            i32.add
            local.set $7
            br $for-loop|3
           end
          end
          local.get $6
          i32.const 1
          i32.add
          local.set $6
          br $for-loop|2
         end
        end
       end
       local.get $0
       local.get $1
       local.get $12
       local.get $13
       local.get $3
       local.get $2
       call $assembly/generation-kernels/submerged-village/roads/carveRoad
       drop
       local.get $0
       local.get $1
       local.get $3
       local.get $2
       local.get $4
       local.get $5
       call $assembly/generation-kernels/submerged-village/roads/carveRoad
       drop
      end
      local.get $8
      i32.const 1
      i32.add
      local.set $8
      br $for-loop|1
     end
    end
    local.get $15
    i32.const 1
    i32.add
    local.set $15
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/roads/collectPathComponents (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_B
  local.get $0
  local.get $1
  i32.mul
  call $assembly/generation-kernels/submerged-village/buffers/clearBitmap
  i32.const 0
  global.set $assembly/generation-kernels/submerged-village/roads/compCount
  i32.const 0
  global.set $assembly/generation-kernels/submerged-village/roads/compTotalTiles
  loop $for-loop|0
   local.get $1
   local.get $4
   i32.gt_s
   if
    i32.const 0
    local.set $3
    loop $for-loop|1
     local.get $0
     local.get $3
     i32.gt_s
     if
      block $for-continue|1
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $4
       i32.mul
       local.get $3
       i32.add
       local.tee $2
       i32.const 2
       i32.shl
       i32.add
       i32.load
       br_if $for-continue|1
       local.get $2
       global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_B
       i32.add
       i32.load8_u
       br_if $for-continue|1
       global.get $assembly/generation-kernels/submerged-village/roads/compTotalTiles
       local.set $8
       i32.const 0
       local.set $5
       global.get $assembly/generation-kernels/common/grid/QUEUE
       i32.const 0
       local.get $3
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/common/grid/QUEUE
       i32.const 1
       local.get $4
       call $~lib/staticarray/StaticArray<i32>#__uset
       i32.const 1
       local.set $6
       local.get $2
       global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_B
       i32.add
       i32.const 1
       i32.store8
       loop $while-continue|2
        local.get $5
        local.get $6
        i32.lt_s
        if
         global.get $assembly/generation-kernels/common/grid/QUEUE
         local.get $5
         i32.const 1
         i32.shl
         local.tee $2
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.set $9
         local.get $5
         i32.const 1
         i32.add
         local.set $5
         global.get $assembly/generation-kernels/submerged-village/roads/COMP_TILES
         global.get $assembly/generation-kernels/submerged-village/roads/compTotalTiles
         local.get $9
         global.get $assembly/generation-kernels/common/grid/QUEUE
         local.get $2
         i32.const 1
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.tee $10
         i32.const 16
         i32.shl
         i32.or
         call $~lib/staticarray/StaticArray<i32>#__uset
         global.get $assembly/generation-kernels/submerged-village/roads/compTotalTiles
         i32.const 1
         i32.add
         global.set $assembly/generation-kernels/submerged-village/roads/compTotalTiles
         i32.const 16
         i32.const 1680
         call $~lib/rt/__newBuffer
         local.set $11
         i32.const 16
         i32.const 1728
         call $~lib/rt/__newBuffer
         local.set $12
         i32.const 0
         local.set $2
         loop $for-loop|3
          local.get $2
          i32.const 4
          i32.lt_s
          if
           block $for-continue|3
            local.get $9
            local.get $11
            local.get $2
            i32.const 2
            i32.shl
            local.tee $13
            i32.add
            i32.load
            i32.add
            local.tee $7
            local.get $0
            i32.lt_s
            local.get $7
            i32.const 0
            i32.ge_s
            i32.and
            local.get $10
            local.get $12
            local.get $13
            i32.add
            i32.load
            i32.add
            local.tee $13
            i32.const 0
            i32.ge_s
            i32.and
            local.get $1
            local.get $13
            i32.gt_s
            i32.and
            i32.eqz
            br_if $for-continue|3
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $13
            i32.mul
            local.get $7
            i32.add
            local.tee $14
            i32.const 2
            i32.shl
            i32.add
            i32.load
            br_if $for-continue|3
            local.get $14
            global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_B
            i32.add
            local.tee $14
            i32.load8_u
            br_if $for-continue|3
            local.get $14
            i32.const 1
            i32.store8
            global.get $assembly/generation-kernels/common/grid/QUEUE
            local.get $6
            i32.const 1
            i32.shl
            local.tee $14
            local.get $7
            call $~lib/staticarray/StaticArray<i32>#__uset
            global.get $assembly/generation-kernels/common/grid/QUEUE
            local.get $14
            i32.const 1
            i32.add
            local.get $13
            call $~lib/staticarray/StaticArray<i32>#__uset
            local.get $6
            i32.const 1
            i32.add
            local.set $6
           end
           local.get $2
           i32.const 1
           i32.add
           local.set $2
           br $for-loop|3
          end
         end
         br $while-continue|2
        end
       end
       global.get $assembly/generation-kernels/submerged-village/roads/compCount
       i32.const 256
       i32.lt_s
       if
        global.get $assembly/generation-kernels/submerged-village/roads/COMP_START
        global.get $assembly/generation-kernels/submerged-village/roads/compCount
        local.get $8
        call $~lib/staticarray/StaticArray<i32>#__uset
        global.get $assembly/generation-kernels/submerged-village/roads/COMP_SIZE
        global.get $assembly/generation-kernels/submerged-village/roads/compCount
        global.get $assembly/generation-kernels/submerged-village/roads/compTotalTiles
        local.get $8
        i32.sub
        call $~lib/staticarray/StaticArray<i32>#__uset
        global.get $assembly/generation-kernels/submerged-village/roads/compCount
        i32.const 1
        i32.add
        global.set $assembly/generation-kernels/submerged-village/roads/compCount
       end
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/roads/ensureGlobalAccessibility (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 i32)
  (local $18 i32)
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/roads/collectPathComponents
  global.get $assembly/generation-kernels/submerged-village/roads/compCount
  i32.const 1
  i32.le_s
  if
   return
  end
  loop $for-loop|0
   local.get $3
   global.get $assembly/generation-kernels/submerged-village/roads/compCount
   i32.lt_s
   if
    local.get $2
    global.get $assembly/generation-kernels/submerged-village/roads/COMP_SIZE
    local.get $3
    i32.const 2
    i32.shl
    i32.add
    i32.load
    local.tee $5
    i32.lt_s
    if
     local.get $3
     local.set $4
     local.get $5
     local.set $2
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
  loop $for-loop|1
   local.get $17
   global.get $assembly/generation-kernels/submerged-village/roads/compCount
   i32.lt_s
   if
    local.get $4
    local.get $17
    i32.ne
    if
     i32.const 99999
     local.set $2
     i32.const 0
     local.set $3
     i32.const 0
     local.set $9
     i32.const 0
     local.set $8
     i32.const 0
     local.set $7
     local.get $4
     i32.const 2
     i32.shl
     local.tee $4
     global.get $assembly/generation-kernels/submerged-village/roads/COMP_START
     i32.add
     i32.load
     local.set $14
     global.get $assembly/generation-kernels/submerged-village/roads/COMP_SIZE
     local.get $4
     i32.add
     i32.load
     local.set $13
     local.get $17
     i32.const 2
     i32.shl
     local.tee $4
     global.get $assembly/generation-kernels/submerged-village/roads/COMP_START
     i32.add
     i32.load
     local.set $12
     global.get $assembly/generation-kernels/submerged-village/roads/COMP_SIZE
     local.get $4
     i32.add
     i32.load
     local.set $11
     i32.const 0
     local.set $16
     loop $for-loop|2
      local.get $13
      local.get $16
      i32.gt_s
      if
       global.get $assembly/generation-kernels/submerged-village/roads/COMP_TILES
       local.get $14
       local.get $16
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.tee $4
       i32.const 65535
       i32.and
       local.set $5
       local.get $4
       i32.const 16
       i32.shr_s
       i32.const 65535
       i32.and
       local.set $4
       i32.const 0
       local.set $15
       loop $for-loop|3
        local.get $11
        local.get $15
        i32.gt_s
        if
         i32.const 0
         local.get $5
         global.get $assembly/generation-kernels/submerged-village/roads/COMP_TILES
         local.get $12
         local.get $15
         i32.add
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.tee $10
         i32.const 65535
         i32.and
         local.tee $6
         i32.sub
         local.tee $18
         i32.sub
         local.get $18
         local.get $18
         i32.const 0
         i32.lt_s
         select
         i32.const 0
         local.get $4
         local.get $10
         i32.const 16
         i32.shr_s
         i32.const 65535
         i32.and
         local.tee $10
         i32.sub
         local.tee $18
         i32.sub
         local.get $18
         local.get $18
         i32.const 0
         i32.lt_s
         select
         i32.add
         local.tee $18
         local.get $2
         i32.lt_s
         if
          local.get $5
          local.set $3
          local.get $4
          local.set $9
          local.get $6
          local.set $8
          local.get $10
          local.set $7
          local.get $18
          local.set $2
         end
         local.get $15
         i32.const 1
         i32.add
         local.set $15
         br $for-loop|3
        end
       end
       local.get $16
       i32.const 1
       i32.add
       local.set $16
       br $for-loop|2
      end
     end
     local.get $0
     local.get $1
     local.get $3
     local.get $9
     local.get $8
     local.get $7
     call $assembly/generation-kernels/submerged-village/roads/carveRoad
     drop
     local.get $0
     local.get $1
     call $assembly/generation-kernels/submerged-village/roads/collectPathComponents
     i32.const 0
     local.set $4
     i32.const 0
     local.set $2
     i32.const 0
     local.set $3
     loop $for-loop|4
      local.get $3
      global.get $assembly/generation-kernels/submerged-village/roads/compCount
      i32.lt_s
      if
       local.get $2
       global.get $assembly/generation-kernels/submerged-village/roads/COMP_SIZE
       local.get $3
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.tee $5
       i32.lt_s
       if
        local.get $3
        local.set $4
        local.get $5
        local.set $2
       end
       local.get $3
       i32.const 1
       i32.add
       local.set $3
       br $for-loop|4
      end
     end
    end
    local.get $17
    i32.const 1
    i32.add
    local.set $17
    br $for-loop|1
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/roads/addDetourRoutes (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=68
  local.tee $5
  i32.const 0
  i32.le_s
  if
   return
  end
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=72
  local.set $7
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=76
  local.set $8
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    i32.const 0
    local.set $4
    loop $for-loop|1
     local.get $0
     local.get $4
     i32.gt_s
     if
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $2
      i32.mul
      local.get $4
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.eqz
      local.get $3
      i32.const 16384
      i32.lt_s
      i32.and
      if
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
       local.get $3
       local.get $4
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
       local.get $3
       local.get $2
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $3
       i32.const 1
       i32.add
       local.set $3
      end
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $3
  i32.const 2
  i32.lt_s
  if
   return
  end
  i32.const 0
  local.set $2
  i32.const 0
  local.set $4
  loop $for-loop|2
   local.get $2
   local.get $5
   i32.lt_s
   local.get $4
   local.get $5
   i32.const 3
   i32.shl
   i32.lt_s
   i32.and
   if
    i32.const 0
    local.get $3
    i32.const 1
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    i32.const 2
    i32.shl
    local.tee $9
    global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
    i32.add
    i32.load
    local.set $6
    global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
    local.get $9
    i32.add
    i32.load
    local.set $10
    local.get $7
    i32.const 0
    local.get $6
    i32.const 0
    local.get $3
    i32.const 1
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    i32.const 2
    i32.shl
    local.tee $11
    global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
    i32.add
    i32.load
    local.tee $9
    i32.sub
    local.tee $12
    i32.sub
    local.get $12
    local.get $12
    i32.const 0
    i32.lt_s
    select
    i32.const 0
    local.get $10
    global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
    local.get $11
    i32.add
    i32.load
    local.tee $11
    i32.sub
    local.tee $12
    i32.sub
    local.get $12
    local.get $12
    i32.const 0
    i32.lt_s
    select
    i32.add
    local.tee $12
    i32.gt_s
    local.get $8
    local.get $12
    i32.lt_s
    i32.or
    i32.eqz
    if
     local.get $2
     i32.const 1
     i32.add
     local.get $2
     local.get $0
     local.get $1
     local.get $6
     local.get $10
     local.get $9
     local.get $11
     call $assembly/generation-kernels/submerged-village/roads/carveRoad
     select
     local.set $2
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|2
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/houses/scatterRubble (param $0 i32) (param $1 i32) (param $2 f64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  local.get $2
  f64.const 0
  f64.le
  if
   return
  end
  i32.const 1
  local.set $5
  loop $for-loop|0
   local.get $5
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    i32.const 1
    local.set $4
    loop $for-loop|1
     local.get $4
     local.get $0
     i32.const 1
     i32.sub
     i32.lt_s
     if
      block $for-continue|1
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $5
       i32.mul
       local.tee $3
       local.get $4
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 1
       i32.ne
       br_if $for-continue|1
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $3
       local.get $4
       i32.const 1
       i32.sub
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.eqz
       local.tee $3
       if (result i32)
        i32.const 1
       else
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $4
        i32.const 1
        i32.add
        local.get $0
        local.get $5
        i32.mul
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
       end
       i32.eqz
       if
        i32.const 1
        local.set $3
       end
       local.get $3
       if (result i32)
        i32.const 1
       else
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $5
        i32.const 1
        i32.sub
        i32.mul
        local.get $4
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
       end
       i32.eqz
       if
        i32.const 1
        local.set $3
       end
       local.get $3
       i32.const 1
       local.get $3
       if (result i32)
        i32.const 1
       else
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $5
        i32.const 1
        i32.add
        i32.mul
        local.get $4
        i32.add
        i32.const 2
        i32.shl
        i32.add
        i32.load
       end
       select
       i32.eqz
       br_if $for-continue|1
       i32.const 0
       local.set $6
       i32.const -1
       local.set $3
       loop $for-loop|2
        local.get $6
        i32.eqz
        local.get $3
        i32.const 1
        i32.le_s
        i32.and
        if
         i32.const -1
         local.set $7
         loop $for-loop|3
          local.get $6
          i32.eqz
          local.get $7
          i32.const 1
          i32.le_s
          i32.and
          if
           i32.const 1
           local.get $6
           local.get $4
           local.get $7
           i32.add
           local.tee $6
           local.get $0
           i32.lt_s
           local.get $6
           i32.const 0
           i32.ge_s
           i32.and
           local.get $3
           local.get $5
           i32.add
           local.tee $8
           i32.const 0
           i32.ge_s
           i32.and
           local.get $1
           local.get $8
           i32.gt_s
           i32.and
           if (result i32)
            global.get $assembly/generation-kernels/common/grid/GRID
            local.get $0
            local.get $8
            i32.mul
            local.get $6
            i32.add
            i32.const 2
            i32.shl
            i32.add
            i32.load
            i32.const 2
            i32.eq
           else
            i32.const 0
           end
           select
           local.set $6
           local.get $7
           i32.const 1
           i32.add
           local.set $7
           br $for-loop|3
          end
         end
         local.get $3
         i32.const 1
         i32.add
         local.set $3
         br $for-loop|2
        end
       end
       call $assembly/generation-kernels/submerged-village/buffers/rng
       local.get $2
       local.get $2
       f64.add
       local.get $2
       local.get $6
       select
       f64.lt
       if
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $0
        local.get $5
        i32.mul
        local.get $4
        i32.add
        i32.const 4
        call $~lib/staticarray/StaticArray<i32>#__uset
       end
      end
      local.get $4
      i32.const 1
      i32.add
      local.set $4
      br $for-loop|1
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/houses/scatterDecorativeTrees (param $0 i32) (param $1 i32) (param $2 f64)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  local.get $2
  f64.const 0
  f64.le
  if
   return
  end
  i32.const 1
  local.set $4
  loop $for-loop|0
   local.get $4
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    i32.const 1
    local.set $3
    loop $for-loop|1
     local.get $3
     local.get $0
     i32.const 1
     i32.sub
     i32.lt_s
     if
      block $for-continue|1
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $4
       i32.mul
       local.tee $6
       local.get $3
       i32.add
       local.tee $5
       i32.const 2
       i32.shl
       i32.add
       i32.load
       br_if $for-continue|1
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $6
       local.get $3
       i32.const 1
       i32.sub
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.eqz
       local.tee $7
       local.get $7
       i32.const 1
       i32.add
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $3
       i32.const 1
       i32.add
       local.get $6
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       select
       local.tee $6
       local.get $6
       i32.const 1
       i32.add
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $4
       i32.const 1
       i32.sub
       i32.mul
       local.get $3
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       select
       local.tee $6
       local.get $6
       i32.const 1
       i32.add
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $4
       i32.const 1
       i32.add
       i32.mul
       local.get $3
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       select
       i32.const 3
       i32.lt_s
       br_if $for-continue|1
       call $assembly/generation-kernels/submerged-village/buffers/rng
       local.get $2
       f64.lt
       if
        global.get $assembly/generation-kernels/common/grid/GRID
        local.get $5
        i32.const 1
        call $~lib/staticarray/StaticArray<i32>#__uset
       end
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/roads/resolveNearMissCorners (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  loop $for-loop|0
   local.get $3
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    i32.const 0
    local.set $2
    loop $for-loop|1
     local.get $2
     local.get $0
     i32.const 1
     i32.sub
     i32.lt_s
     if
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $3
      i32.const 1
      i32.add
      i32.mul
      local.tee $4
      local.get $2
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $5
      i32.eqz
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $3
      i32.mul
      local.tee $6
      local.get $2
      i32.const 1
      i32.add
      local.tee $7
      i32.add
      local.tee $8
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.eqz
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $2
      local.get $6
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $4
      local.get $7
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.or
      i32.or
      i32.or
      i32.eqz
      if
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $8
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 2
       i32.ne
       local.tee $4
       local.get $5
       i32.const 2
       i32.ne
       local.tee $5
       i32.and
       if
        call $assembly/generation-kernels/submerged-village/buffers/rng
        f64.const 0.5
        f64.lt
        if
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $8
         i32.const 0
         call $~lib/staticarray/StaticArray<i32>#__uset
        else
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $3
         i32.const 1
         i32.add
         i32.mul
         local.get $2
         i32.add
         i32.const 0
         call $~lib/staticarray/StaticArray<i32>#__uset
        end
       else
        local.get $4
        if
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $2
         i32.const 1
         i32.add
         local.get $0
         local.get $3
         i32.mul
         i32.add
         i32.const 0
         call $~lib/staticarray/StaticArray<i32>#__uset
        else
         local.get $5
         if
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $0
          local.get $3
          i32.const 1
          i32.add
          i32.mul
          local.get $2
          i32.add
          i32.const 0
          call $~lib/staticarray/StaticArray<i32>#__uset
         end
        end
       end
      end
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $2
      i32.const 1
      i32.add
      local.tee $4
      local.get $0
      local.get $3
      i32.const 1
      i32.add
      i32.mul
      local.tee $5
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $6
      i32.eqz
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $3
      i32.mul
      local.tee $7
      local.get $2
      i32.add
      local.tee $8
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.eqz
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $4
      local.get $7
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $2
      local.get $5
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.or
      i32.or
      i32.or
      i32.eqz
      if
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $8
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.const 2
       i32.ne
       local.tee $4
       local.get $6
       i32.const 2
       i32.ne
       local.tee $5
       i32.and
       if
        call $assembly/generation-kernels/submerged-village/buffers/rng
        f64.const 0.5
        f64.lt
        if
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $8
         i32.const 0
         call $~lib/staticarray/StaticArray<i32>#__uset
        else
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $2
         i32.const 1
         i32.add
         local.get $0
         local.get $3
         i32.const 1
         i32.add
         i32.mul
         i32.add
         i32.const 0
         call $~lib/staticarray/StaticArray<i32>#__uset
        end
       else
        local.get $4
        if
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $3
         i32.mul
         local.get $2
         i32.add
         i32.const 0
         call $~lib/staticarray/StaticArray<i32>#__uset
        else
         local.get $5
         if
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $2
          i32.const 1
          i32.add
          local.get $0
          local.get $3
          i32.const 1
          i32.add
          i32.mul
          i32.add
          i32.const 0
          call $~lib/staticarray/StaticArray<i32>#__uset
         end
        end
       end
      end
      local.get $2
      i32.const 1
      i32.add
      local.set $2
      br $for-loop|1
     end
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/roads/reduceDeadEnds (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
  local.get $0
  local.get $1
  i32.mul
  call $assembly/generation-kernels/submerged-village/buffers/clearBitmap
  loop $for-loop|0
   local.get $2
   global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
   i32.lt_s
   if
    global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
    local.get $0
    local.get $2
    i32.const 2
    i32.shl
    local.tee $3
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
    i32.add
    i32.load
    i32.mul
    global.get $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
    local.get $3
    i32.add
    i32.load
    i32.add
    i32.add
    i32.const 1
    i32.store8
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  i32.const 0
  local.set $2
  loop $for-loop|1
   local.get $0
   local.get $2
   i32.gt_s
   if
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $2
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.eqz
    if
     local.get $2
     global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
     i32.add
     i32.const 1
     i32.store8
    end
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $1
    i32.const 1
    i32.sub
    local.get $0
    i32.mul
    local.get $2
    i32.add
    local.tee $3
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.eqz
    if
     local.get $3
     global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
     i32.add
     i32.const 1
     i32.store8
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|1
   end
  end
  i32.const 0
  local.set $2
  loop $for-loop|2
   local.get $1
   local.get $2
   i32.gt_s
   if
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $0
    local.get $2
    i32.mul
    local.tee $3
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.eqz
    if
     local.get $3
     global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
     i32.add
     i32.const 1
     i32.store8
    end
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $0
    local.get $2
    i32.mul
    local.tee $3
    local.get $0
    i32.const 1
    i32.sub
    i32.add
    i32.const 2
    i32.shl
    i32.add
    i32.load
    i32.eqz
    if
     global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
     local.get $0
     local.get $3
     i32.add
     i32.const 1
     i32.sub
     i32.add
     i32.const 1
     i32.store8
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|2
   end
  end
  loop $for-loop|3
   local.get $4
   i32.const 6
   i32.lt_s
   if
    block $for-break3
     i32.const 0
     local.set $5
     i32.const 1
     local.set $2
     loop $for-loop|4
      local.get $2
      local.get $1
      i32.const 1
      i32.sub
      i32.lt_s
      if
       i32.const 1
       local.set $3
       loop $for-loop|5
        local.get $3
        local.get $0
        i32.const 1
        i32.sub
        i32.lt_s
        if
         block $for-continue|5
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $0
          local.get $2
          i32.mul
          local.tee $6
          local.get $3
          i32.add
          local.tee $7
          i32.const 2
          i32.shl
          i32.add
          i32.load
          br_if $for-continue|5
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $6
          local.get $3
          i32.const 1
          i32.sub
          i32.add
          i32.const 2
          i32.shl
          i32.add
          i32.load
          i32.eqz
          local.tee $8
          local.get $8
          i32.const 1
          i32.add
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $3
          i32.const 1
          i32.add
          local.get $6
          i32.add
          i32.const 2
          i32.shl
          i32.add
          i32.load
          select
          local.tee $6
          local.get $6
          i32.const 1
          i32.add
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $0
          local.get $2
          i32.const 1
          i32.sub
          i32.mul
          local.get $3
          i32.add
          i32.const 2
          i32.shl
          i32.add
          i32.load
          select
          local.tee $6
          local.get $6
          i32.const 1
          i32.add
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $0
          local.get $2
          i32.const 1
          i32.add
          i32.mul
          local.get $3
          i32.add
          i32.const 2
          i32.shl
          i32.add
          i32.load
          select
          i32.const 1
          i32.ne
          br_if $for-continue|5
          local.get $7
          global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
          i32.add
          i32.load8_u
          br_if $for-continue|5
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $7
          i32.const 1
          call $~lib/staticarray/StaticArray<i32>#__uset
          i32.const 1
          local.set $5
         end
         local.get $3
         i32.const 1
         i32.add
         local.set $3
         br $for-loop|5
        end
       end
       local.get $2
       i32.const 1
       i32.add
       local.set $2
       br $for-loop|4
      end
     end
     local.get $5
     i32.eqz
     br_if $for-break3
     local.get $4
     i32.const 1
     i32.add
     local.set $4
     br $for-loop|3
    end
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/terrain/paintWaterPonds (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  (local $15 i32)
  (local $16 i32)
  (local $17 f64)
  (local $18 i32)
  (local $19 i32)
  (local $20 i32)
  (local $21 i32)
  (local $22 i32)
  (local $23 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=84
  i32.const 1
  i32.add
  local.set $10
  local.get $0
  local.get $1
  i32.mul
  local.set $13
  loop $for-loop|0
   local.get $2
   local.get $14
   i32.gt_s
   if
    block $for-continue|0
     call $assembly/generation-kernels/submerged-village/buffers/rng
     f64.const 0.45
     f64.lt
     i32.eqz
     if
      i32.const 0
      local.set $4
      i32.const 0
      local.set $9
      loop $for-loop|1
       local.get $4
       i32.eqz
       local.get $9
       i32.const 24
       i32.lt_s
       i32.and
       if
        block $for-continue|1
         local.get $10
         i32.const 2
         i32.add
         local.tee $3
         local.get $0
         local.get $10
         i32.sub
         i32.const 3
         i32.sub
         call $assembly/generation-kernels/submerged-village/buffers/rngInt
         local.tee $5
         local.get $3
         local.get $1
         local.get $10
         i32.sub
         i32.const 3
         i32.sub
         call $assembly/generation-kernels/submerged-village/buffers/rngInt
         local.tee $3
         local.get $0
         i32.mul
         i32.add
         i32.const 2
         i32.shl
         global.get $assembly/generation-kernels/common/grid/GRID
         i32.add
         i32.load
         i32.const 1
         i32.ne
         br_if $for-continue|1
         i32.const 0
         i32.const 16
         call $assembly/generation-kernels/submerged-village/buffers/rngInt
         i32.const 12
         i32.add
         local.set $7
         global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
         local.get $13
         call $assembly/generation-kernels/submerged-village/buffers/clearBitmap
         global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
         i32.const 0
         local.get $5
         call $~lib/staticarray/StaticArray<i32>#__uset
         global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
         i32.const 0
         local.get $3
         call $~lib/staticarray/StaticArray<i32>#__uset
         i32.const 1
         local.set $3
         i32.const 0
         local.set $8
         loop $while-continue|2
          local.get $7
          local.get $8
          i32.gt_s
          local.get $3
          i32.const 0
          i32.gt_s
          i32.and
          if
           i32.const 0
           local.get $3
           i32.const 1
           i32.sub
           local.tee $3
           call $assembly/generation-kernels/submerged-village/buffers/rngInt
           local.tee $5
           i32.const 2
           i32.shl
           local.tee $6
           global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
           i32.add
           i32.load
           local.set $11
           global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
           local.get $6
           i32.add
           i32.load
           local.set $12
           global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
           local.get $5
           local.get $3
           i32.const 2
           i32.shl
           local.tee $6
           global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
           i32.add
           i32.load
           call $~lib/staticarray/StaticArray<i32>#__uset
           global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
           local.get $5
           global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
           local.get $6
           i32.add
           i32.load
           call $~lib/staticarray/StaticArray<i32>#__uset
           local.get $12
           i32.const 1
           i32.le_s
           local.get $11
           i32.const 1
           i32.le_s
           i32.or
           local.get $11
           local.get $0
           i32.const 2
           i32.sub
           i32.ge_s
           i32.or
           local.get $12
           local.get $1
           i32.const 2
           i32.sub
           i32.ge_s
           i32.or
           br_if $while-continue|2
           local.get $0
           local.get $12
           i32.mul
           local.get $11
           i32.add
           local.tee $5
           global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
           i32.add
           local.tee $6
           i32.load8_u
           br_if $while-continue|2
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $5
           i32.const 2
           i32.shl
           i32.add
           i32.load
           i32.const 1
           i32.ne
           br_if $while-continue|2
           local.get $6
           i32.const 1
           i32.store8
           local.get $8
           i32.const 1
           i32.add
           local.set $8
           i32.const 16
           i32.const 1776
           call $~lib/rt/__newBuffer
           local.set $5
           i32.const 16
           i32.const 1824
           call $~lib/rt/__newBuffer
           local.set $15
           i32.const 0
           local.set $6
           loop $for-loop|3
            local.get $6
            i32.const 4
            i32.lt_s
            if
             local.get $11
             local.get $5
             local.get $6
             i32.const 2
             i32.shl
             local.tee $16
             i32.add
             i32.load
             i32.add
             local.tee $18
             local.get $0
             i32.lt_s
             local.get $18
             i32.const 0
             i32.ge_s
             i32.and
             local.get $12
             local.get $15
             local.get $16
             i32.add
             i32.load
             i32.add
             local.tee $16
             i32.const 0
             i32.ge_s
             i32.and
             local.get $1
             local.get $16
             i32.gt_s
             i32.and
             if (result i32)
              global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
              local.get $0
              local.get $16
              i32.mul
              local.get $18
              i32.add
              i32.add
              i32.load8_u
             else
              i32.const 1
             end
             i32.eqz
             if
              local.get $3
              i32.const 500
              i32.lt_s
              call $assembly/generation-kernels/submerged-village/buffers/rng
              f64.const 0.82
              f64.lt
              i32.and
              if
               global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
               local.get $3
               local.get $18
               call $~lib/staticarray/StaticArray<i32>#__uset
               global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
               local.get $3
               local.get $16
               call $~lib/staticarray/StaticArray<i32>#__uset
               local.get $3
               i32.const 1
               i32.add
               local.set $3
              end
             end
             local.get $6
             i32.const 1
             i32.add
             local.set $6
             br $for-loop|3
            end
           end
           br $while-continue|2
          end
         end
         local.get $8
         i32.const 10
         i32.lt_s
         br_if $for-continue|1
         i32.const 0
         local.set $3
         i32.const 32
         i32.const 1872
         call $~lib/rt/__newBuffer
         local.set $8
         i32.const 32
         i32.const 1936
         call $~lib/rt/__newBuffer
         local.set $11
         i32.const 0
         local.set $5
         loop $for-loop|4
          local.get $3
          i32.eqz
          local.get $1
          local.get $5
          i32.gt_s
          i32.and
          if
           i32.const 0
           local.set $7
           loop $for-loop|5
            local.get $3
            i32.eqz
            local.get $0
            local.get $7
            i32.gt_s
            i32.and
            if
             global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
             local.get $0
             local.get $5
             i32.mul
             local.get $7
             i32.add
             i32.add
             i32.load8_u
             if
              i32.const 0
              local.set $6
              loop $for-loop|6 (result i32)
               local.get $6
               i32.const 8
               i32.lt_s
               if (result i32)
                block $for-break6
                 local.get $7
                 local.get $8
                 local.get $6
                 i32.const 2
                 i32.shl
                 local.tee $12
                 i32.add
                 i32.load
                 i32.add
                 local.tee $15
                 local.get $0
                 i32.lt_s
                 local.get $15
                 i32.const 0
                 i32.ge_s
                 i32.and
                 local.get $5
                 local.get $11
                 local.get $12
                 i32.add
                 i32.load
                 i32.add
                 local.tee $12
                 i32.const 0
                 i32.ge_s
                 i32.and
                 local.get $1
                 local.get $12
                 i32.gt_s
                 i32.and
                 i32.eqz
                 br_if $for-break6
                 local.get $0
                 local.get $12
                 i32.mul
                 local.get $15
                 i32.add
                 local.tee $12
                 global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
                 i32.add
                 i32.load8_u
                 i32.eqz
                 if
                  global.get $assembly/generation-kernels/common/grid/GRID
                  local.get $12
                  i32.const 2
                  i32.shl
                  i32.add
                  i32.load
                  i32.const 1
                  i32.ne
                  br_if $for-break6
                 end
                 local.get $6
                 i32.const 1
                 i32.add
                 local.set $6
                 br $for-loop|6
                end
                i32.const 1
               else
                local.get $3
               end
              end
              local.set $3
             end
             local.get $7
             i32.const 1
             i32.add
             local.set $7
             br $for-loop|5
            end
           end
           local.get $5
           i32.const 1
           i32.add
           local.set $5
           br $for-loop|4
          end
         end
         local.get $3
         br_if $for-continue|1
         i32.const 0
         local.set $3
         loop $for-loop|7
          local.get $1
          local.get $3
          i32.gt_s
          if
           i32.const 0
           local.set $5
           loop $for-loop|8
            local.get $0
            local.get $5
            i32.gt_s
            if
             local.get $0
             local.get $3
             i32.mul
             local.get $5
             i32.add
             local.tee $4
             global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
             i32.add
             i32.load8_u
             if
              global.get $assembly/generation-kernels/common/grid/GRID
              local.get $4
              i32.const 9
              call $~lib/staticarray/StaticArray<i32>#__uset
             end
             local.get $5
             i32.const 1
             i32.add
             local.set $5
             br $for-loop|8
            end
           end
           local.get $3
           i32.const 1
           i32.add
           local.set $3
           br $for-loop|7
          end
         end
         i32.const 1
         local.set $4
        end
        local.get $9
        i32.const 1
        i32.add
        local.set $9
        br $for-loop|1
       end
      end
      br $for-continue|0
     end
     i32.const 0
     local.set $15
     i32.const 16
     i32.const 2000
     call $~lib/rt/__newBuffer
     local.set $21
     i32.const 16
     i32.const 2048
     call $~lib/rt/__newBuffer
     local.set $22
     i32.const 0
     local.set $11
     loop $for-loop|9
      local.get $15
      i32.eqz
      local.get $11
      i32.const 36
      i32.lt_s
      i32.and
      if
       block $for-continue|9
        local.get $10
        i32.const 2
        i32.add
        local.tee $3
        local.get $0
        local.get $10
        i32.sub
        i32.const 3
        i32.sub
        call $assembly/generation-kernels/submerged-village/buffers/rngInt
        local.tee $8
        local.get $3
        local.get $1
        local.get $10
        i32.sub
        i32.const 3
        i32.sub
        call $assembly/generation-kernels/submerged-village/buffers/rngInt
        local.tee $9
        local.get $0
        i32.mul
        i32.add
        i32.const 2
        i32.shl
        global.get $assembly/generation-kernels/common/grid/GRID
        i32.add
        i32.load
        i32.const 1
        i32.ne
        br_if $for-continue|9
        i32.const 2
        i32.const 1
        call $assembly/generation-kernels/submerged-village/buffers/rng
        f64.const 0.22
        f64.lt
        select
        local.set $18
        i32.const 0
        i32.const 7
        call $assembly/generation-kernels/submerged-village/buffers/rngInt
        i32.const 7
        i32.add
        local.set $16
        i32.const 0
        i32.const 3
        call $assembly/generation-kernels/submerged-village/buffers/rngInt
        local.set $3
        i32.const 1
        local.set $5
        i32.const 0
        local.set $4
        global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
        local.get $13
        call $assembly/generation-kernels/submerged-village/buffers/clearBitmap
        i32.const 0
        local.set $12
        loop $for-loop|10
         local.get $5
         local.get $12
         local.get $16
         i32.lt_s
         i32.and
         if
          block $for-break10
           i32.const 0
           local.get $18
           i32.sub
           local.set $7
           loop $for-loop|11
            local.get $5
            local.get $7
            local.get $18
            i32.le_s
            i32.and
            if
             i32.const 0
             local.get $18
             i32.sub
             local.set $6
             loop $for-loop|12 (result i32)
              local.get $6
              local.get $18
              i32.le_s
              if (result i32)
               block $for-break12
                i32.const 0
                local.get $6
                i32.sub
                local.get $6
                local.get $6
                i32.const 0
                i32.lt_s
                select
                i32.const 0
                local.get $7
                i32.sub
                local.get $7
                local.get $7
                i32.const 0
                i32.lt_s
                select
                i32.add
                local.get $18
                local.get $18
                i32.const 2
                i32.eq
                i32.add
                i32.le_s
                if
                 local.get $6
                 local.get $8
                 i32.add
                 local.tee $19
                 local.get $0
                 i32.lt_s
                 local.get $19
                 i32.const 0
                 i32.ge_s
                 i32.and
                 local.get $7
                 local.get $9
                 i32.add
                 local.tee $20
                 i32.const 0
                 i32.ge_s
                 i32.and
                 local.get $1
                 local.get $20
                 i32.gt_s
                 i32.and
                 i32.eqz
                 local.get $19
                 i32.const 0
                 i32.le_s
                 i32.or
                 local.get $20
                 i32.const 0
                 i32.le_s
                 i32.or
                 local.get $19
                 local.get $0
                 i32.const 1
                 i32.sub
                 i32.ge_s
                 i32.or
                 local.get $20
                 local.get $1
                 i32.const 1
                 i32.sub
                 i32.ge_s
                 i32.or
                 br_if $for-break12
                 global.get $assembly/generation-kernels/common/grid/GRID
                 local.get $0
                 local.get $20
                 i32.mul
                 local.get $19
                 i32.add
                 local.tee $23
                 i32.const 2
                 i32.shl
                 i32.add
                 i32.load
                 i32.const 1
                 i32.ne
                 br_if $for-break12
                 local.get $23
                 global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
                 i32.add
                 local.tee $23
                 i32.load8_u
                 i32.eqz
                 if
                  local.get $23
                  i32.const 1
                  i32.store8
                  global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
                  local.get $4
                  local.get $19
                  call $~lib/staticarray/StaticArray<i32>#__uset
                  global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
                  local.get $4
                  local.get $20
                  call $~lib/staticarray/StaticArray<i32>#__uset
                  local.get $4
                  i32.const 1
                  i32.add
                  local.set $4
                 end
                end
                local.get $6
                i32.const 1
                i32.add
                local.set $6
                br $for-loop|12
               end
               i32.const 0
              else
               local.get $5
              end
             end
             local.set $5
             local.get $7
             i32.const 1
             i32.add
             local.set $7
             br $for-loop|11
            end
           end
           local.get $5
           i32.eqz
           br_if $for-break10
           call $assembly/generation-kernels/submerged-village/buffers/rng
           local.tee $17
           f64.const 0.3
           f64.lt
           if
            local.get $17
            f64.const 0.15
            f64.lt
            if (result i32)
             i32.const 3
             local.get $3
             i32.const 2
             i32.eq
             local.get $3
             i32.const 1
             i32.eq
             select
             i32.const 2
             local.get $3
             select
            else
             i32.const 2
             local.get $3
             i32.const 2
             i32.ne
             local.get $3
             i32.const 1
             i32.eq
             select
             i32.const 3
             local.get $3
             select
            end
            local.set $3
           end
           i32.const 0
           local.get $5
           local.get $8
           local.get $21
           local.get $3
           i32.const 2
           i32.shl
           local.tee $5
           i32.add
           i32.load
           i32.add
           local.tee $8
           local.get $0
           i32.lt_s
           local.get $8
           i32.const 0
           i32.ge_s
           i32.and
           local.get $9
           local.get $5
           local.get $22
           i32.add
           i32.load
           i32.add
           local.tee $9
           i32.const 0
           i32.ge_s
           i32.and
           local.get $1
           local.get $9
           i32.gt_s
           i32.and
           i32.eqz
           local.get $8
           i32.const 1
           i32.le_s
           i32.or
           local.get $9
           i32.const 1
           i32.le_s
           i32.or
           local.get $8
           local.get $0
           i32.const 2
           i32.sub
           i32.ge_s
           i32.or
           local.get $9
           local.get $1
           i32.const 2
           i32.sub
           i32.ge_s
           i32.or
           select
           local.set $5
           local.get $12
           i32.const 1
           i32.add
           local.set $12
           br $for-loop|10
          end
         end
        end
        local.get $5
        i32.eqz
        local.get $4
        i32.const 14
        i32.lt_s
        i32.or
        br_if $for-continue|9
        i32.const 0
        local.set $3
        loop $for-loop|13
         local.get $3
         local.get $4
         i32.lt_s
         if
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $3
          i32.const 2
          i32.shl
          local.tee $5
          global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
          i32.add
          i32.load
          global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
          local.get $5
          i32.add
          i32.load
          local.get $0
          i32.mul
          i32.add
          i32.const 9
          call $~lib/staticarray/StaticArray<i32>#__uset
          local.get $3
          i32.const 1
          i32.add
          local.set $3
          br $for-loop|13
         end
        end
        i32.const 1
        local.set $15
       end
       local.get $11
       i32.const 1
       i32.add
       local.set $11
       br $for-loop|9
      end
     end
    end
    local.get $14
    i32.const 1
    i32.add
    local.set $14
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/terrain/paintCliffFormations (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  (local $13 i32)
  (local $14 i32)
  local.get $2
  i32.const 0
  i32.le_s
  if
   return
  end
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=84
  i32.const 1
  i32.add
  local.set $7
  loop $for-loop|0
   local.get $2
   local.get $8
   i32.gt_s
   if
    call $assembly/generation-kernels/submerged-village/buffers/rng
    f64.const 0.4
    f64.lt
    local.set $3
    local.get $7
    i32.const 2
    i32.add
    local.tee $4
    local.get $0
    local.get $7
    i32.sub
    i32.const 3
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $5
    local.get $4
    local.get $1
    local.get $7
    i32.sub
    i32.const 3
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $6
    local.get $3
    if
     i32.const 0
     i32.const 15
     call $assembly/generation-kernels/submerged-village/buffers/rngInt
     i32.const 8
     i32.add
     local.set $9
     global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
     local.get $0
     local.get $1
     i32.mul
     call $assembly/generation-kernels/submerged-village/buffers/clearBitmap
     global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
     i32.const 0
     local.get $5
     call $~lib/staticarray/StaticArray<i32>#__uset
     global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
     i32.const 0
     local.get $6
     call $~lib/staticarray/StaticArray<i32>#__uset
     i32.const 1
     local.set $3
     i32.const 0
     local.set $4
     loop $while-continue|1
      local.get $4
      local.get $9
      i32.lt_s
      local.get $3
      i32.const 0
      i32.gt_s
      i32.and
      if
       i32.const 0
       local.get $3
       i32.const 1
       i32.sub
       local.tee $3
       call $assembly/generation-kernels/submerged-village/buffers/rngInt
       local.tee $5
       i32.const 2
       i32.shl
       local.tee $6
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
       i32.add
       i32.load
       local.set $10
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
       local.get $6
       i32.add
       i32.load
       local.set $6
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
       local.get $5
       local.get $3
       i32.const 2
       i32.shl
       local.tee $11
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
       i32.add
       i32.load
       call $~lib/staticarray/StaticArray<i32>#__uset
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
       local.get $5
       global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
       local.get $11
       i32.add
       i32.load
       call $~lib/staticarray/StaticArray<i32>#__uset
       local.get $7
       local.get $10
       i32.gt_s
       local.get $10
       local.get $0
       local.get $7
       i32.sub
       i32.ge_s
       i32.or
       local.get $6
       local.get $7
       i32.lt_s
       i32.or
       local.get $6
       local.get $1
       local.get $7
       i32.sub
       i32.ge_s
       i32.or
       br_if $while-continue|1
       local.get $0
       local.get $6
       i32.mul
       local.get $10
       i32.add
       local.tee $5
       global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
       i32.add
       local.tee $11
       i32.load8_u
       br_if $while-continue|1
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $5
       i32.const 2
       i32.shl
       i32.add
       i32.load
       local.tee $5
       i32.eqz
       local.get $5
       i32.const 2
       i32.eq
       i32.or
       local.get $5
       i32.const 3
       i32.eq
       i32.or
       local.get $5
       i32.const 9
       i32.eq
       i32.or
       br_if $while-continue|1
       local.get $11
       i32.const 1
       i32.store8
       local.get $4
       i32.const 1
       i32.add
       local.set $4
       i32.const 16
       i32.const 2096
       call $~lib/rt/__newBuffer
       local.set $11
       i32.const 16
       i32.const 2144
       call $~lib/rt/__newBuffer
       local.set $12
       i32.const 0
       local.set $5
       loop $for-loop|2
        local.get $5
        i32.const 4
        i32.lt_s
        if
         local.get $10
         local.get $11
         local.get $5
         i32.const 2
         i32.shl
         local.tee $13
         i32.add
         i32.load
         i32.add
         local.tee $14
         local.get $0
         i32.lt_s
         local.get $14
         i32.const 0
         i32.ge_s
         i32.and
         local.get $6
         local.get $12
         local.get $13
         i32.add
         i32.load
         i32.add
         local.tee $13
         i32.const 0
         i32.ge_s
         i32.and
         local.get $1
         local.get $13
         i32.gt_s
         i32.and
         if (result i32)
          global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
          local.get $0
          local.get $13
          i32.mul
          local.get $14
          i32.add
          i32.add
          i32.load8_u
         else
          i32.const 1
         end
         i32.eqz
         local.get $3
         i32.const 500
         i32.lt_s
         i32.and
         if
          global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
          local.get $3
          local.get $14
          call $~lib/staticarray/StaticArray<i32>#__uset
          global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
          local.get $3
          local.get $13
          call $~lib/staticarray/StaticArray<i32>#__uset
          local.get $3
          i32.const 1
          i32.add
          local.set $3
         end
         local.get $5
         i32.const 1
         i32.add
         local.set $5
         br $for-loop|2
        end
       end
       br $while-continue|1
      end
     end
     i32.const 0
     local.set $3
     loop $for-loop|3
      local.get $1
      local.get $3
      i32.gt_s
      if
       i32.const 0
       local.set $4
       loop $for-loop|4
        local.get $0
        local.get $4
        i32.gt_s
        if
         global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
         local.get $0
         local.get $3
         i32.mul
         local.get $4
         i32.add
         i32.add
         i32.load8_u
         if
          i32.const 0
          local.set $5
          i32.const 16
          i32.const 2192
          call $~lib/rt/__newBuffer
          local.set $9
          i32.const 16
          i32.const 2240
          call $~lib/rt/__newBuffer
          local.set $10
          i32.const 0
          local.set $6
          loop $for-loop|5
           local.get $6
           i32.const 4
           i32.lt_s
           if
            block $for-break5
             local.get $4
             local.get $9
             local.get $6
             i32.const 2
             i32.shl
             local.tee $11
             i32.add
             i32.load
             i32.add
             local.tee $12
             local.get $0
             i32.lt_s
             local.get $12
             i32.const 0
             i32.ge_s
             i32.and
             local.get $3
             local.get $10
             local.get $11
             i32.add
             i32.load
             i32.add
             local.tee $11
             i32.const 0
             i32.ge_s
             i32.and
             local.get $1
             local.get $11
             i32.gt_s
             i32.and
             if (result i32)
              global.get $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
              local.get $0
              local.get $11
              i32.mul
              local.get $12
              i32.add
              i32.add
              i32.load8_u
             else
              i32.const 0
             end
             i32.eqz
             if
              i32.const 1
              local.set $5
              br $for-break5
             end
             local.get $6
             i32.const 1
             i32.add
             local.set $6
             br $for-loop|5
            end
           end
          end
          local.get $5
          if
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $3
           i32.mul
           local.get $4
           i32.add
           i32.const 5
           call $~lib/staticarray/StaticArray<i32>#__uset
          else
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $3
           i32.mul
           local.get $4
           i32.add
           i32.const 6
           call $~lib/staticarray/StaticArray<i32>#__uset
          end
         end
         local.get $4
         i32.const 1
         i32.add
         local.set $4
         br $for-loop|4
        end
       end
       local.get $3
       i32.const 1
       i32.add
       local.set $3
       br $for-loop|3
      end
     end
    else
     i32.const 0
     i32.const 3
     call $assembly/generation-kernels/submerged-village/buffers/rngInt
     i32.const 2
     i32.add
     local.set $9
     i32.const 0
     i32.const 0
     i32.const 3
     call $assembly/generation-kernels/submerged-village/buffers/rngInt
     i32.const 2
     i32.add
     local.tee $10
     i32.sub
     local.set $3
     loop $for-loop|6
      local.get $3
      local.get $10
      i32.le_s
      if
       i32.const 0
       local.get $9
       i32.sub
       local.set $4
       loop $for-loop|7
        local.get $4
        local.get $9
        i32.le_s
        if
         block $for-continue|7
          local.get $4
          local.get $5
          i32.add
          local.tee $11
          local.get $0
          i32.lt_s
          local.get $11
          i32.const 0
          i32.ge_s
          i32.and
          local.get $3
          local.get $6
          i32.add
          local.tee $12
          i32.const 0
          i32.ge_s
          i32.and
          local.get $1
          local.get $12
          i32.gt_s
          i32.and
          i32.eqz
          br_if $for-continue|7
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $0
          local.get $12
          i32.mul
          local.get $11
          i32.add
          local.tee $13
          i32.const 2
          i32.shl
          i32.add
          i32.load
          local.tee $14
          i32.eqz
          local.get $14
          i32.const 2
          i32.eq
          i32.or
          local.get $14
          i32.const 3
          i32.eq
          i32.or
          local.get $14
          i32.const 9
          i32.eq
          i32.or
          br_if $for-continue|7
          local.get $10
          i32.const 0
          local.get $3
          i32.sub
          local.get $3
          local.get $3
          i32.const 0
          i32.lt_s
          select
          i32.eq
          local.get $9
          i32.const 0
          local.get $4
          i32.sub
          local.get $4
          local.get $4
          i32.const 0
          i32.lt_s
          select
          i32.eq
          i32.or
          if
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $13
           i32.const 5
           call $~lib/staticarray/StaticArray<i32>#__uset
          else
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $0
           local.get $12
           i32.mul
           local.get $11
           i32.add
           i32.const 6
           call $~lib/staticarray/StaticArray<i32>#__uset
          end
         end
         local.get $4
         i32.const 1
         i32.add
         local.set $4
         br $for-loop|7
        end
       end
       local.get $3
       i32.const 1
       i32.add
       local.set $3
       br $for-loop|6
      end
     end
    end
    local.get $8
    i32.const 1
    i32.add
    local.set $8
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/terrain/paintHillClusters (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=84
  local.set $5
  loop $for-loop|0
   local.get $2
   local.get $6
   i32.gt_s
   if
    local.get $5
    i32.const 2
    i32.add
    local.tee $3
    local.get $0
    local.get $5
    i32.sub
    i32.const 3
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $7
    local.get $3
    local.get $1
    local.get $5
    i32.sub
    i32.const 3
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $8
    i32.const 0
    local.set $3
    loop $for-loop|1
     local.get $3
     i32.const 1
     i32.le_s
     if
      i32.const 0
      local.set $4
      loop $for-loop|2
       local.get $4
       i32.const 1
       i32.le_s
       if
        block $for-continue|2
         local.get $4
         local.get $7
         i32.add
         local.tee $9
         local.get $0
         i32.lt_s
         local.get $9
         i32.const 0
         i32.ge_s
         i32.and
         local.get $3
         local.get $8
         i32.add
         local.tee $10
         i32.const 0
         i32.ge_s
         i32.and
         local.get $1
         local.get $10
         i32.gt_s
         i32.and
         i32.eqz
         br_if $for-continue|2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $10
         i32.mul
         local.get $9
         i32.add
         local.tee $9
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.tee $10
         i32.eqz
         local.get $10
         i32.const 2
         i32.eq
         i32.or
         local.get $10
         i32.const 3
         i32.eq
         i32.or
         local.get $10
         i32.const 9
         i32.eq
         i32.or
         local.get $10
         i32.const 5
         i32.eq
         i32.or
         br_if $for-continue|2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $9
         i32.const 6
         call $~lib/staticarray/StaticArray<i32>#__uset
        end
        local.get $4
        i32.const 1
        i32.add
        local.set $4
        br $for-loop|2
       end
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/terrain/paintGrassPatches (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  (local $11 i32)
  (local $12 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=84
  local.set $5
  loop $for-loop|0
   local.get $2
   local.get $6
   i32.gt_s
   if
    local.get $5
    i32.const 1
    i32.add
    local.tee $3
    local.get $0
    local.get $5
    i32.sub
    i32.const 2
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $7
    local.get $3
    local.get $1
    local.get $5
    i32.sub
    i32.const 2
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $8
    i32.const 0
    i32.const 3
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    i32.const 2
    i32.add
    local.set $9
    i32.const 0
    i32.const 3
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    i32.const 2
    i32.add
    local.set $10
    i32.const 0
    local.set $3
    loop $for-loop|1
     local.get $3
     local.get $10
     i32.lt_s
     if
      i32.const 0
      local.set $4
      loop $for-loop|2
       local.get $4
       local.get $9
       i32.lt_s
       if
        block $for-continue|2
         local.get $4
         local.get $7
         i32.add
         local.tee $11
         local.get $0
         i32.lt_s
         local.get $11
         i32.const 0
         i32.ge_s
         i32.and
         local.get $3
         local.get $8
         i32.add
         local.tee $12
         i32.const 0
         i32.ge_s
         i32.and
         local.get $1
         local.get $12
         i32.gt_s
         i32.and
         i32.eqz
         br_if $for-continue|2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $12
         i32.mul
         local.get $11
         i32.add
         local.tee $11
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.tee $12
         i32.const 7
         i32.ne
         local.get $12
         i32.const 1
         i32.ne
         i32.and
         br_if $for-continue|2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $11
         i32.const 7
         call $~lib/staticarray/StaticArray<i32>#__uset
        end
        local.get $4
        i32.const 1
        i32.add
        local.set $4
        br $for-loop|2
       end
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/terrain/paintSandPatches (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  (local $9 i32)
  (local $10 i32)
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=84
  local.set $5
  loop $for-loop|0
   local.get $2
   local.get $6
   i32.gt_s
   if
    local.get $5
    i32.const 1
    i32.add
    local.tee $3
    local.get $0
    local.get $5
    i32.sub
    i32.const 2
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $7
    local.get $3
    local.get $1
    local.get $5
    i32.sub
    i32.const 2
    i32.sub
    call $assembly/generation-kernels/submerged-village/buffers/rngInt
    local.set $8
    i32.const 0
    local.set $3
    loop $for-loop|1
     local.get $3
     i32.const 1
     i32.le_s
     if
      i32.const 0
      local.set $4
      loop $for-loop|2
       local.get $4
       i32.const 1
       i32.le_s
       if
        block $for-continue|2
         local.get $4
         local.get $7
         i32.add
         local.tee $9
         local.get $0
         i32.lt_s
         local.get $9
         i32.const 0
         i32.ge_s
         i32.and
         local.get $3
         local.get $8
         i32.add
         local.tee $10
         i32.const 0
         i32.ge_s
         i32.and
         local.get $1
         local.get $10
         i32.gt_s
         i32.and
         i32.eqz
         br_if $for-continue|2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $0
         local.get $10
         i32.mul
         local.get $9
         i32.add
         local.tee $9
         i32.const 2
         i32.shl
         i32.add
         i32.load
         local.tee $10
         i32.const 7
         i32.ne
         local.get $10
         i32.const 1
         i32.ne
         i32.and
         br_if $for-continue|2
         global.get $assembly/generation-kernels/common/grid/GRID
         local.get $9
         i32.const 8
         call $~lib/staticarray/StaticArray<i32>#__uset
        end
        local.get $4
        i32.const 1
        i32.add
        local.set $4
        br $for-loop|2
       end
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $6
    i32.const 1
    i32.add
    local.set $6
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/terrain/enforceCliffClearance (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  loop $for-loop|0
   local.get $1
   local.get $3
   i32.gt_s
   if
    i32.const 0
    local.set $2
    loop $for-loop|1
     local.get $0
     local.get $2
     i32.gt_s
     if
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $3
      i32.mul
      local.get $2
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.const 5
      i32.eq
      if
       i32.const 16
       i32.const 2288
       call $~lib/rt/__newBuffer
       local.set $5
       i32.const 16
       i32.const 2336
       call $~lib/rt/__newBuffer
       local.set $6
       i32.const 0
       local.set $4
       loop $for-loop|2
        local.get $4
        i32.const 4
        i32.lt_s
        if
         local.get $2
         local.get $5
         local.get $4
         i32.const 2
         i32.shl
         local.tee $7
         i32.add
         i32.load
         i32.add
         local.tee $8
         local.get $0
         i32.lt_s
         local.get $8
         i32.const 0
         i32.ge_s
         i32.and
         local.get $3
         local.get $6
         local.get $7
         i32.add
         i32.load
         i32.add
         local.tee $7
         i32.const 0
         i32.ge_s
         i32.and
         local.get $1
         local.get $7
         i32.gt_s
         i32.and
         if
          global.get $assembly/generation-kernels/common/grid/GRID
          local.get $0
          local.get $7
          i32.mul
          local.get $8
          i32.add
          local.tee $7
          i32.const 2
          i32.shl
          i32.add
          i32.load
          local.tee $8
          i32.const 4
          i32.eq
          local.get $8
          i32.const 10
          i32.eq
          i32.or
          if
           global.get $assembly/generation-kernels/common/grid/GRID
           local.get $7
           i32.const 0
           call $~lib/staticarray/StaticArray<i32>#__uset
          end
         end
         local.get $4
         i32.const 1
         i32.add
         local.set $4
         br $for-loop|2
        end
       end
      end
      local.get $2
      i32.const 1
      i32.add
      local.set $2
      br $for-loop|1
     end
    end
    local.get $3
    i32.const 1
    i32.add
    local.set $3
    br $for-loop|0
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/terrain/applyBiomeTerrainFeatures (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  loop $for-loop|0
   local.get $1
   local.get $2
   i32.gt_s
   if
    i32.const 0
    local.set $3
    loop $for-loop|1
     local.get $0
     local.get $3
     i32.gt_s
     if
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $2
      i32.mul
      local.get $3
      i32.add
      local.tee $5
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $4
      i32.const 4
      i32.ne
      i32.const 0
      local.get $4
      i32.const 3
      i32.ne
      i32.const 0
      local.get $4
      i32.const 2
      i32.ne
      i32.const 0
      local.get $4
      select
      select
      select
      if
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $5
       i32.const 1
       call $~lib/staticarray/StaticArray<i32>#__uset
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=104
  call $assembly/generation-kernels/submerged-village/terrain/paintWaterPonds
  local.get $0
  local.get $1
  i32.const 9
  i32.const 1
  i32.const 10
  call $assembly/generation-kernels/shared/remove-small-components/removeSmallComponentsInPlace
  local.get $0
  local.get $1
  i32.const 9
  i32.const 1
  i32.const 6
  call $assembly/generation-kernels/shared/enforce-min-thickness/enforceMinThickness2x2InPlace
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=88
  call $assembly/generation-kernels/submerged-village/terrain/paintCliffFormations
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=92
  call $assembly/generation-kernels/submerged-village/terrain/paintHillClusters
  local.get $0
  local.get $1
  i32.const 0
  i32.const 9
  i32.const 5
  i32.const 5
  call $assembly/generation-kernels/shared/repair-cliff-gaps/repairCliffGapsInPlace
  local.get $0
  local.get $1
  i32.const 0
  i32.const 9
  i32.const 5
  i32.const 6
  i32.const 5
  call $assembly/generation-kernels/shared/cliff-shell-integrity/enforceCliffShellIntegrityInPlace
  local.get $0
  local.get $1
  i32.const 5
  i32.const 1
  i32.const 3
  call $assembly/generation-kernels/shared/remove-small-components/removeSmallComponentsInPlace
  local.get $0
  local.get $1
  i32.const 6
  i32.const 1
  i32.const 1
  i32.const 5
  i32.const 1
  call $assembly/generation-kernels/shared/enforce-exact-bundles/enforceExact2x2BundlesInPlace
  local.get $0
  local.get $1
  i32.const 6
  i32.const 1
  i32.const 4
  call $assembly/generation-kernels/shared/remove-small-components/removeSmallComponentsInPlace
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=96
  call $assembly/generation-kernels/submerged-village/terrain/paintGrassPatches
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=100
  call $assembly/generation-kernels/submerged-village/terrain/paintSandPatches
  local.get $0
  local.get $1
  i32.const 7
  i32.const 1
  i32.const 3
  call $assembly/generation-kernels/shared/enforce-min-thickness/enforceMinThickness2x2InPlace
  local.get $0
  local.get $1
  i32.const 8
  i32.const 1
  i32.const 3
  call $assembly/generation-kernels/shared/enforce-min-thickness/enforceMinThickness2x2InPlace
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/terrain/enforceCliffClearance
 )
 (func $assembly/generation-kernels/submerged-village/roads/repairPathGapsAfterBiome (param $0 i32) (param $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  (local $7 i32)
  (local $8 i32)
  i32.const 1
  local.set $4
  loop $for-loop|0
   local.get $4
   local.get $1
   i32.const 1
   i32.sub
   i32.lt_s
   if
    i32.const 1
    local.set $3
    loop $for-loop|1
     local.get $3
     local.get $0
     i32.const 1
     i32.sub
     i32.lt_s
     if
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $4
      i32.mul
      local.tee $5
      local.get $3
      i32.add
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.tee $6
      i32.eqz
      local.get $6
      i32.const 9
      i32.eq
      i32.or
      local.get $6
      i32.const 5
      i32.eq
      i32.or
      local.get $6
      i32.const 2
      i32.eq
      i32.or
      local.get $6
      i32.const 3
      i32.eq
      i32.or
      i32.eqz
      if
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $5
       local.get $3
       i32.const 1
       i32.add
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.eqz
       local.tee $7
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $5
       local.get $3
       i32.const 1
       i32.sub
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.eqz
       local.tee $5
       i32.and
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $4
       i32.const 1
       i32.sub
       i32.mul
       local.get $3
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.eqz
       local.tee $6
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $0
       local.get $4
       i32.const 1
       i32.add
       i32.mul
       local.get $3
       i32.add
       i32.const 2
       i32.shl
       i32.add
       i32.load
       i32.eqz
       local.tee $8
       i32.and
       i32.or
       local.get $6
       local.get $8
       i32.add
       local.get $7
       i32.add
       local.get $5
       i32.add
       i32.const 3
       i32.ge_u
       i32.or
       if
        global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
        local.get $2
        local.get $3
        call $~lib/staticarray/StaticArray<i32>#__uset
        global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
        local.get $2
        local.get $4
        call $~lib/staticarray/StaticArray<i32>#__uset
        local.get $2
        i32.const 1
        i32.add
        local.set $2
       end
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $4
    i32.const 1
    i32.add
    local.set $4
    br $for-loop|0
   end
  end
  i32.const 0
  local.set $1
  loop $for-loop|2
   local.get $1
   local.get $2
   i32.lt_s
   if
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $1
    i32.const 2
    i32.shl
    local.tee $3
    global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_X
    i32.add
    i32.load
    global.get $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
    local.get $3
    i32.add
    i32.load
    local.get $0
    i32.mul
    i32.add
    i32.const 0
    call $~lib/staticarray/StaticArray<i32>#__uset
    local.get $1
    i32.const 1
    i32.add
    local.set $1
    br $for-loop|2
   end
  end
 )
 (func $assembly/generation-kernels/submerged-village/algorithm/generateSubmergedVillage (param $0 i32) (param $1 i32) (param $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  local.get $1
  i32.mul
  local.tee $3
  i32.const 0
  i32.le_s
  local.get $3
  i32.const 16384
  i32.gt_s
  i32.or
  if
   return
  end
  local.get $2
  global.set $assembly/generation-kernels/submerged-village/buffers/rngState
  i32.const 0
  local.set $2
  loop $for-loop|0
   local.get $2
   local.get $3
   i32.lt_s
   if
    global.get $assembly/generation-kernels/common/grid/GRID
    local.get $2
    i32.const 1
    call $~lib/staticarray/StaticArray<i32>#__uset
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|0
   end
  end
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/houses/placeAllHouses
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=16
  call $assembly/generation-kernels/submerged-village/houses/clearAroundHouses
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=24
  call $assembly/generation-kernels/submerged-village/houses/growVillageGround
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=28
  f64.convert_i32_s
  f64.const 1e3
  f64.div
  call $assembly/generation-kernels/submerged-village/houses/placeFences
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=52
  call $assembly/generation-kernels/submerged-village/roads/carveDoorStubs
  global.get $assembly/generation-kernels/submerged-village/buffers/houseCount
  i32.const 0
  i32.gt_s
  if
   local.get $0
   local.get $1
   call $assembly/generation-kernels/submerged-village/roads/buildGraphAndCarve
  end
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/roads/ensureBorderAccess
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/roads/ensureGlobalAccessibility
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/roads/addDetourRoutes
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=32
  f64.convert_i32_s
  f64.const 1e3
  f64.div
  call $assembly/generation-kernels/submerged-village/houses/scatterRubble
  local.get $0
  local.get $1
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=20
  f64.convert_i32_s
  f64.const 1e3
  f64.div
  call $assembly/generation-kernels/submerged-village/houses/scatterDecorativeTrees
  global.get $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.load offset=80
  if
   local.get $0
   local.get $1
   i32.const 0
   i32.const 1
   i32.const 10
   call $assembly/generation-kernels/shared/fix-double-wide/fixDoubleWideInPlace
  end
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/roads/resolveNearMissCorners
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/roads/reduceDeadEnds
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/terrain/applyBiomeTerrainFeatures
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/roads/repairPathGapsAfterBiome
  i32.const 0
  local.set $2
  loop $for-loop|00
   local.get $1
   local.get $2
   i32.gt_s
   if
    i32.const 0
    local.set $3
    loop $for-loop|1
     local.get $0
     local.get $3
     i32.gt_s
     if
      global.get $assembly/generation-kernels/common/grid/GRID
      local.get $0
      local.get $2
      i32.mul
      local.get $3
      i32.add
      local.tee $4
      i32.const 2
      i32.shl
      i32.add
      i32.load
      i32.const 1
      i32.eq
      if
       global.get $assembly/generation-kernels/common/grid/GRID
       local.get $4
       i32.const 10
       call $~lib/staticarray/StaticArray<i32>#__uset
      end
      local.get $3
      i32.const 1
      i32.add
      local.set $3
      br $for-loop|1
     end
    end
    local.get $2
    i32.const 1
    i32.add
    local.set $2
    br $for-loop|00
   end
  end
  local.get $0
  local.get $1
  call $assembly/generation-kernels/submerged-village/roads/ensureGlobalAccessibility
 )
 (func $~start
  i32.const 2364
  global.set $~lib/rt/stub/offset
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/common/grid/GRID
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/common/grid/PATH_BUF
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/common/grid/LABELS
  i32.const 32768
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/common/grid/QUEUE
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/common/grid/OPEN_F
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/common/grid/OPEN_IDX
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/common/grid/G_COST
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/common/grid/CAME_FROM
  call $~lib/staticarray/StaticArray<u8>#constructor
  global.set $assembly/generation-kernels/common/grid/CLOSED
  i32.const 16384
  global.set $assembly/generation-kernels/common/grid/currentMaxCells
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/shared/extend-dead-ends/DEAD_ENDS
  i32.const 32
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/PARAMS
  i32.const 24
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HOUSE_OX
  i32.const 24
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HOUSE_OY
  i32.const 24
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_X
  i32.const 24
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HOUSE_DOOR_Y
  i32.const 24
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HOUSE_SHAPE
  i32.const 24
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_START
  i32.const 24
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HOUSE_TILE_COUNT
  i32.const 720
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HTILES_X
  i32.const 720
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/HTILES_Y
  call $~lib/staticarray/StaticArray<u8>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/BITMAP_A
  call $~lib/staticarray/StaticArray<u8>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/BITMAP_B
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/TEMP_X
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/buffers/TEMP_Y
  i32.const 30
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/houses/TMPL_X
  i32.const 30
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/houses/TMPL_Y
  i32.const 8
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/houses/DOOR_DX
  i32.const 8
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/houses/DOOR_DY
  i32.const 8
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/houses/POOL
  i32.const 8
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/houses/CTR_X
  i32.const 8
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/houses/CTR_Y
  i32.const 128
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/roads/EDGE_A
  i32.const 128
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/roads/EDGE_B
  i32.const 128
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/roads/EDGE_D
  i32.const 256
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/roads/COMP_START
  i32.const 256
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/roads/COMP_SIZE
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/submerged-village/roads/COMP_TILES
 )
)
