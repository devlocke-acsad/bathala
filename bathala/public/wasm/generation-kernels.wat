(module
 (type $0 (func (param i32) (result i32)))
 (type $1 (func (result i32)))
 (type $2 (func (param i32 i32 i32 i32 i32)))
 (type $3 (func (param i32 i32 i32 i32 i32 i32 i32)))
 (type $4 (func (param i32 i32 i32 i32)))
 (type $5 (func (param i32 i32) (result i32)))
 (type $6 (func (param i32 i32 i32)))
 (type $7 (func (param i32 i32 i32 i32 i32 i32)))
 (type $8 (func (param i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32 i32) (result i32)))
 (type $9 (func))
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
 (func $~lib/rt/__newBuffer (param $0 i32) (result i32)
  (local $1 i32)
  i32.const 16
  i32.const 4
  call $~lib/rt/stub/__new
  local.set $1
  local.get $0
  if
   local.get $1
   local.get $0
   i32.const 16
   memory.copy
  end
  local.get $1
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
         i32.const 1296
         call $~lib/rt/__newBuffer
         local.set $12
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
         i32.const 1392
         call $~lib/rt/__newBuffer
         local.set $16
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
         i32.const 1488
         call $~lib/rt/__newBuffer
         local.set $15
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
  i32.const 1584
  call $~lib/rt/__newBuffer
  local.set $21
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
 (func $~start
  (local $0 i32)
  i32.const 1660
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
  i32.const 16384
  i32.const 5
  call $~lib/rt/stub/__new
  local.tee $0
  i32.const 0
  i32.const 16384
  memory.fill
  local.get $0
  global.set $assembly/generation-kernels/common/grid/CLOSED
  i32.const 16384
  global.set $assembly/generation-kernels/common/grid/currentMaxCells
  i32.const 16384
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/shared/extend-dead-ends/DEAD_ENDS
 )
)
