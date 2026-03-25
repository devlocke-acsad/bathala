(module
 (type $0 (func (param i32 i32)))
 (type $1 (func (param i32 i32) (result i32)))
 (type $2 (func (param i32 i32 i32 i32)))
 (type $3 (func))
 (type $4 (func (result i32)))
 (type $5 (func (param i32)))
 (type $6 (func (param i32) (result i32)))
 (type $7 (func (param i32 i32 i32)))
 (type $8 (func (param i32 i32 i32 i32 i32)))
 (import "env" "abort" (func $~lib/builtins/abort (param i32 i32 i32 i32)))
 (global $assembly/generation-kernels/index/MAX_WIDTH i32 (i32.const 128))
 (global $assembly/generation-kernels/index/MAX_HEIGHT i32 (i32.const 128))
 (global $assembly/generation-kernels/index/MAX_CELLS i32 (i32.const 16384))
 (global $~lib/shared/runtime/Runtime.Stub i32 (i32.const 0))
 (global $~lib/shared/runtime/Runtime.Minimal i32 (i32.const 1))
 (global $~lib/shared/runtime/Runtime.Incremental i32 (i32.const 2))
 (global $~lib/rt/stub/startOffset (mut i32) (i32.const 0))
 (global $~lib/rt/stub/offset (mut i32) (i32.const 0))
 (global $~lib/native/ASC_RUNTIME i32 (i32.const 0))
 (global $assembly/generation-kernels/index/GRID (mut i32) (i32.const 0))
 (global $assembly/generation-kernels/index/DEAD_ENDS (mut i32) (i32.const 0))
 (global $~lib/memory/__heap_base i32 (i32.const 252))
 (memory $0 1)
 (data $0 (i32.const 12) ",\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\1c\00\00\00I\00n\00v\00a\00l\00i\00d\00 \00l\00e\00n\00g\00t\00h\00")
 (data $1 (i32.const 60) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00&\00\00\00~\00l\00i\00b\00/\00s\00t\00a\00t\00i\00c\00a\00r\00r\00a\00y\00.\00t\00s\00\00\00\00\00\00\00")
 (data $2 (i32.const 124) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00(\00\00\00A\00l\00l\00o\00c\00a\00t\00i\00o\00n\00 \00t\00o\00o\00 \00l\00a\00r\00g\00e\00\00\00\00\00")
 (data $3 (i32.const 188) "<\00\00\00\00\00\00\00\00\00\00\00\02\00\00\00\1e\00\00\00~\00l\00i\00b\00/\00r\00t\00/\00s\00t\00u\00b\00.\00t\00s\00\00\00\00\00\00\00\00\00\00\00\00\00\00\00")
 (table $0 1 1 funcref)
 (elem $0 (i32.const 1))
 (export "getGridPtr" (func $assembly/generation-kernels/index/getGridPtr))
 (export "getMaxCells" (func $assembly/generation-kernels/index/getMaxCells))
 (export "fixDoubleWideInPlace" (func $assembly/generation-kernels/index/fixDoubleWideInPlace))
 (export "extendDeadEndsInPlace" (func $assembly/generation-kernels/index/extendDeadEndsInPlace))
 (export "memory" (memory $0))
 (start $~start)
 (func $~lib/rt/stub/maybeGrowMemory (param $0 i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  (local $5 i32)
  (local $6 i32)
  memory.size
  local.set $1
  local.get $1
  i32.const 16
  i32.shl
  i32.const 15
  i32.add
  i32.const 15
  i32.const -1
  i32.xor
  i32.and
  local.set $2
  local.get $0
  local.get $2
  i32.gt_u
  if
   local.get $0
   local.get $2
   i32.sub
   i32.const 65535
   i32.add
   i32.const 65535
   i32.const -1
   i32.xor
   i32.and
   i32.const 16
   i32.shr_u
   local.set $3
   local.get $1
   local.tee $4
   local.get $3
   local.tee $5
   local.get $4
   local.get $5
   i32.gt_s
   select
   local.set $6
   local.get $6
   memory.grow
   i32.const 0
   i32.lt_s
   if
    local.get $3
    memory.grow
    i32.const 0
    i32.lt_s
    if
     unreachable
    end
   end
  end
  local.get $0
  global.set $~lib/rt/stub/offset
 )
 (func $~lib/rt/common/BLOCK#set:mmInfo (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store
 )
 (func $~lib/rt/stub/__alloc (param $0 i32) (result i32)
  (local $1 i32)
  (local $2 i32)
  (local $3 i32)
  (local $4 i32)
  local.get $0
  i32.const 1073741820
  i32.gt_u
  if
   i32.const 144
   i32.const 208
   i32.const 33
   i32.const 29
   call $~lib/builtins/abort
   unreachable
  end
  global.get $~lib/rt/stub/offset
  local.set $1
  global.get $~lib/rt/stub/offset
  i32.const 4
  i32.add
  local.set $2
  block $~lib/rt/stub/computeSize|inlined.0 (result i32)
   local.get $0
   local.set $3
   local.get $3
   i32.const 4
   i32.add
   i32.const 15
   i32.add
   i32.const 15
   i32.const -1
   i32.xor
   i32.and
   i32.const 4
   i32.sub
   br $~lib/rt/stub/computeSize|inlined.0
  end
  local.set $4
  local.get $2
  local.get $4
  i32.add
  call $~lib/rt/stub/maybeGrowMemory
  local.get $1
  local.get $4
  call $~lib/rt/common/BLOCK#set:mmInfo
  local.get $2
  return
 )
 (func $~lib/rt/common/OBJECT#set:gcInfo (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=4
 )
 (func $~lib/rt/common/OBJECT#set:gcInfo2 (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=8
 )
 (func $~lib/rt/common/OBJECT#set:rtId (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=12
 )
 (func $~lib/rt/common/OBJECT#set:rtSize (param $0 i32) (param $1 i32)
  local.get $0
  local.get $1
  i32.store offset=16
 )
 (func $~lib/rt/stub/__new (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $0
  i32.const 1073741804
  i32.gt_u
  if
   i32.const 144
   i32.const 208
   i32.const 86
   i32.const 30
   call $~lib/builtins/abort
   unreachable
  end
  i32.const 16
  local.get $0
  i32.add
  call $~lib/rt/stub/__alloc
  local.set $2
  local.get $2
  i32.const 4
  i32.sub
  local.set $3
  local.get $3
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo
  local.get $3
  i32.const 0
  call $~lib/rt/common/OBJECT#set:gcInfo2
  local.get $3
  local.get $1
  call $~lib/rt/common/OBJECT#set:rtId
  local.get $3
  local.get $0
  call $~lib/rt/common/OBJECT#set:rtSize
  local.get $2
  i32.const 16
  i32.add
  return
 )
 (func $~lib/staticarray/StaticArray<i32>#constructor (param $0 i32) (param $1 i32) (result i32)
  (local $2 i32)
  (local $3 i32)
  local.get $1
  i32.const 1073741820
  i32.const 2
  i32.shr_u
  i32.gt_u
  if
   i32.const 32
   i32.const 80
   i32.const 51
   i32.const 60
   call $~lib/builtins/abort
   unreachable
  end
  local.get $1
  i32.const 2
  i32.shl
  local.set $2
  local.get $2
  i32.const 4
  call $~lib/rt/stub/__new
  local.set $3
  i32.const 0
  global.get $~lib/shared/runtime/Runtime.Incremental
  i32.ne
  drop
  local.get $3
  i32.const 0
  local.get $2
  memory.fill
  local.get $3
  return
 )
 (func $start:assembly/generation-kernels/index
  global.get $~lib/memory/__heap_base
  i32.const 4
  i32.add
  i32.const 15
  i32.add
  i32.const 15
  i32.const -1
  i32.xor
  i32.and
  i32.const 4
  i32.sub
  global.set $~lib/rt/stub/startOffset
  global.get $~lib/rt/stub/startOffset
  global.set $~lib/rt/stub/offset
  i32.const 0
  global.get $assembly/generation-kernels/index/MAX_CELLS
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/index/GRID
  i32.const 0
  global.get $assembly/generation-kernels/index/MAX_CELLS
  call $~lib/staticarray/StaticArray<i32>#constructor
  global.set $assembly/generation-kernels/index/DEAD_ENDS
 )
 (func $assembly/generation-kernels/index/getGridPtr (result i32)
  global.get $assembly/generation-kernels/index/GRID
  return
 )
 (func $assembly/generation-kernels/index/getMaxCells (result i32)
  global.get $assembly/generation-kernels/index/MAX_CELLS
  return
 )
 (func $~lib/staticarray/StaticArray<i32>#__uget (param $0 i32) (param $1 i32) (result i32)
  local.get $0
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  i32.load
  return
 )
 (func $~lib/staticarray/StaticArray<i32>#__uset (param $0 i32) (param $1 i32) (param $2 i32)
  local.get $0
  local.get $1
  i32.const 2
  i32.shl
  i32.add
  local.get $2
  i32.store
  i32.const 0
  drop
 )
 (func $assembly/generation-kernels/index/fixDoubleWideInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32) (param $4 i32)
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
  (local $30 i32)
  (local $31 i32)
  (local $32 i32)
  (local $33 i32)
  (local $34 i32)
  (local $35 i32)
  (local $36 i32)
  (local $37 i32)
  (local $38 i32)
  (local $39 i32)
  (local $40 i32)
  (local $41 i32)
  (local $42 i32)
  (local $43 i32)
  (local $44 i32)
  (local $45 i32)
  (local $46 i32)
  (local $47 i32)
  (local $48 i32)
  (local $49 i32)
  (local $50 i32)
  (local $51 i32)
  (local $52 i32)
  (local $53 i32)
  (local $54 i32)
  (local $55 i32)
  (local $56 i32)
  (local $57 i32)
  (local $58 i32)
  (local $59 i32)
  (local $60 i32)
  (local $61 i32)
  (local $62 i32)
  (local $63 i32)
  (local $64 i32)
  (local $65 i32)
  (local $66 i32)
  (local $67 i32)
  (local $68 i32)
  (local $69 i32)
  (local $70 i32)
  i32.const 0
  local.set $5
  i32.const 1
  local.set $6
  loop $while-continue|0
   local.get $6
   if (result i32)
    local.get $5
    local.get $4
    i32.lt_s
   else
    i32.const 0
   end
   if
    i32.const 0
    local.set $6
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    i32.const 0
    local.set $7
    loop $while-continue|1
     local.get $7
     local.get $1
     i32.const 1
     i32.sub
     i32.lt_s
     if
      i32.const 0
      local.set $8
      loop $while-continue|2
       local.get $8
       local.get $0
       i32.const 1
       i32.sub
       i32.lt_s
       if
        block $assembly/generation-kernels/index/getCell|inlined.0 (result i32)
         local.get $8
         local.set $9
         local.get $7
         local.set $10
         local.get $0
         local.set $11
         global.get $assembly/generation-kernels/index/GRID
         block $assembly/generation-kernels/index/idx|inlined.0 (result i32)
          local.get $9
          local.set $12
          local.get $10
          local.set $13
          local.get $11
          local.set $14
          local.get $13
          local.get $14
          i32.mul
          local.get $12
          i32.add
          br $assembly/generation-kernels/index/idx|inlined.0
         end
         call $~lib/staticarray/StaticArray<i32>#__uget
         br $assembly/generation-kernels/index/getCell|inlined.0
        end
        local.get $2
        i32.eq
        if (result i32)
         block $assembly/generation-kernels/index/getCell|inlined.1 (result i32)
          local.get $8
          i32.const 1
          i32.add
          local.set $15
          local.get $7
          local.set $16
          local.get $0
          local.set $17
          global.get $assembly/generation-kernels/index/GRID
          block $assembly/generation-kernels/index/idx|inlined.1 (result i32)
           local.get $15
           local.set $18
           local.get $16
           local.set $19
           local.get $17
           local.set $20
           local.get $19
           local.get $20
           i32.mul
           local.get $18
           i32.add
           br $assembly/generation-kernels/index/idx|inlined.1
          end
          call $~lib/staticarray/StaticArray<i32>#__uget
          br $assembly/generation-kernels/index/getCell|inlined.1
         end
         local.get $2
         i32.eq
        else
         i32.const 0
        end
        if (result i32)
         block $assembly/generation-kernels/index/getCell|inlined.2 (result i32)
          local.get $8
          local.set $21
          local.get $7
          i32.const 1
          i32.add
          local.set $22
          local.get $0
          local.set $23
          global.get $assembly/generation-kernels/index/GRID
          block $assembly/generation-kernels/index/idx|inlined.2 (result i32)
           local.get $21
           local.set $24
           local.get $22
           local.set $25
           local.get $23
           local.set $26
           local.get $25
           local.get $26
           i32.mul
           local.get $24
           i32.add
           br $assembly/generation-kernels/index/idx|inlined.2
          end
          call $~lib/staticarray/StaticArray<i32>#__uget
          br $assembly/generation-kernels/index/getCell|inlined.2
         end
         local.get $2
         i32.eq
        else
         i32.const 0
        end
        if (result i32)
         block $assembly/generation-kernels/index/getCell|inlined.3 (result i32)
          local.get $8
          i32.const 1
          i32.add
          local.set $27
          local.get $7
          i32.const 1
          i32.add
          local.set $28
          local.get $0
          local.set $29
          global.get $assembly/generation-kernels/index/GRID
          block $assembly/generation-kernels/index/idx|inlined.3 (result i32)
           local.get $27
           local.set $30
           local.get $28
           local.set $31
           local.get $29
           local.set $32
           local.get $31
           local.get $32
           i32.mul
           local.get $30
           i32.add
           br $assembly/generation-kernels/index/idx|inlined.3
          end
          call $~lib/staticarray/StaticArray<i32>#__uget
          br $assembly/generation-kernels/index/getCell|inlined.3
         end
         local.get $2
         i32.eq
        else
         i32.const 0
        end
        if
         local.get $8
         local.set $33
         local.get $7
         local.set $34
         i32.const 999
         local.set $35
         i32.const 0
         local.set $36
         loop $for-loop|3
          local.get $36
          i32.const 4
          i32.lt_s
          if
           local.get $8
           local.get $36
           i32.const 1
           i32.and
           i32.add
           local.set $37
           local.get $7
           local.get $36
           i32.const 1
           i32.shr_s
           i32.const 1
           i32.and
           i32.add
           local.set $38
           i32.const 0
           local.set $39
           local.get $37
           local.get $8
           i32.ge_s
           if (result i32)
            local.get $37
            local.get $8
            i32.const 1
            i32.add
            i32.le_s
           else
            i32.const 0
           end
           if (result i32)
            local.get $38
            i32.const 1
            i32.add
            local.get $7
            i32.ge_s
           else
            i32.const 0
           end
           if (result i32)
            local.get $38
            i32.const 1
            i32.add
            local.get $7
            i32.const 1
            i32.add
            i32.le_s
           else
            i32.const 0
           end
           i32.eqz
           if
            local.get $38
            i32.const 1
            i32.add
            local.get $1
            i32.lt_s
            if (result i32)
             block $assembly/generation-kernels/index/getCell|inlined.4 (result i32)
              local.get $37
              local.set $40
              local.get $38
              i32.const 1
              i32.add
              local.set $41
              local.get $0
              local.set $42
              global.get $assembly/generation-kernels/index/GRID
              block $assembly/generation-kernels/index/idx|inlined.4 (result i32)
               local.get $40
               local.set $43
               local.get $41
               local.set $44
               local.get $42
               local.set $45
               local.get $44
               local.get $45
               i32.mul
               local.get $43
               i32.add
               br $assembly/generation-kernels/index/idx|inlined.4
              end
              call $~lib/staticarray/StaticArray<i32>#__uget
              br $assembly/generation-kernels/index/getCell|inlined.4
             end
             local.get $2
             i32.eq
            else
             i32.const 0
            end
            if
             local.get $39
             i32.const 1
             i32.add
             local.set $39
            end
           end
           local.get $37
           i32.const 1
           i32.add
           local.get $8
           i32.ge_s
           if (result i32)
            local.get $37
            i32.const 1
            i32.add
            local.get $8
            i32.const 1
            i32.add
            i32.le_s
           else
            i32.const 0
           end
           if (result i32)
            local.get $38
            local.get $7
            i32.ge_s
           else
            i32.const 0
           end
           if (result i32)
            local.get $38
            local.get $7
            i32.const 1
            i32.add
            i32.le_s
           else
            i32.const 0
           end
           i32.eqz
           if
            local.get $37
            i32.const 1
            i32.add
            local.get $0
            i32.lt_s
            if (result i32)
             block $assembly/generation-kernels/index/getCell|inlined.5 (result i32)
              local.get $37
              i32.const 1
              i32.add
              local.set $46
              local.get $38
              local.set $47
              local.get $0
              local.set $48
              global.get $assembly/generation-kernels/index/GRID
              block $assembly/generation-kernels/index/idx|inlined.5 (result i32)
               local.get $46
               local.set $49
               local.get $47
               local.set $50
               local.get $48
               local.set $51
               local.get $50
               local.get $51
               i32.mul
               local.get $49
               i32.add
               br $assembly/generation-kernels/index/idx|inlined.5
              end
              call $~lib/staticarray/StaticArray<i32>#__uget
              br $assembly/generation-kernels/index/getCell|inlined.5
             end
             local.get $2
             i32.eq
            else
             i32.const 0
            end
            if
             local.get $39
             i32.const 1
             i32.add
             local.set $39
            end
           end
           local.get $37
           local.get $8
           i32.ge_s
           if (result i32)
            local.get $37
            local.get $8
            i32.const 1
            i32.add
            i32.le_s
           else
            i32.const 0
           end
           if (result i32)
            local.get $38
            i32.const 1
            i32.sub
            local.get $7
            i32.ge_s
           else
            i32.const 0
           end
           if (result i32)
            local.get $38
            i32.const 1
            i32.sub
            local.get $7
            i32.const 1
            i32.add
            i32.le_s
           else
            i32.const 0
           end
           i32.eqz
           if
            local.get $38
            i32.const 1
            i32.sub
            i32.const 0
            i32.ge_s
            if (result i32)
             block $assembly/generation-kernels/index/getCell|inlined.6 (result i32)
              local.get $37
              local.set $52
              local.get $38
              i32.const 1
              i32.sub
              local.set $53
              local.get $0
              local.set $54
              global.get $assembly/generation-kernels/index/GRID
              block $assembly/generation-kernels/index/idx|inlined.6 (result i32)
               local.get $52
               local.set $55
               local.get $53
               local.set $56
               local.get $54
               local.set $57
               local.get $56
               local.get $57
               i32.mul
               local.get $55
               i32.add
               br $assembly/generation-kernels/index/idx|inlined.6
              end
              call $~lib/staticarray/StaticArray<i32>#__uget
              br $assembly/generation-kernels/index/getCell|inlined.6
             end
             local.get $2
             i32.eq
            else
             i32.const 0
            end
            if
             local.get $39
             i32.const 1
             i32.add
             local.set $39
            end
           end
           local.get $37
           i32.const 1
           i32.sub
           local.get $8
           i32.ge_s
           if (result i32)
            local.get $37
            i32.const 1
            i32.sub
            local.get $8
            i32.const 1
            i32.add
            i32.le_s
           else
            i32.const 0
           end
           if (result i32)
            local.get $38
            local.get $7
            i32.ge_s
           else
            i32.const 0
           end
           if (result i32)
            local.get $38
            local.get $7
            i32.const 1
            i32.add
            i32.le_s
           else
            i32.const 0
           end
           i32.eqz
           if
            local.get $37
            i32.const 1
            i32.sub
            i32.const 0
            i32.ge_s
            if (result i32)
             block $assembly/generation-kernels/index/getCell|inlined.7 (result i32)
              local.get $37
              i32.const 1
              i32.sub
              local.set $58
              local.get $38
              local.set $59
              local.get $0
              local.set $60
              global.get $assembly/generation-kernels/index/GRID
              block $assembly/generation-kernels/index/idx|inlined.7 (result i32)
               local.get $58
               local.set $61
               local.get $59
               local.set $62
               local.get $60
               local.set $63
               local.get $62
               local.get $63
               i32.mul
               local.get $61
               i32.add
               br $assembly/generation-kernels/index/idx|inlined.7
              end
              call $~lib/staticarray/StaticArray<i32>#__uget
              br $assembly/generation-kernels/index/getCell|inlined.7
             end
             local.get $2
             i32.eq
            else
             i32.const 0
            end
            if
             local.get $39
             i32.const 1
             i32.add
             local.set $39
            end
           end
           local.get $39
           local.get $35
           i32.lt_s
           if
            local.get $39
            local.set $35
            local.get $37
            local.set $33
            local.get $38
            local.set $34
           end
           local.get $36
           i32.const 1
           i32.add
           local.set $36
           br $for-loop|3
          end
         end
         local.get $33
         local.set $64
         local.get $34
         local.set $65
         local.get $0
         local.set $66
         local.get $3
         local.set $67
         global.get $assembly/generation-kernels/index/GRID
         block $assembly/generation-kernels/index/idx|inlined.8 (result i32)
          local.get $64
          local.set $68
          local.get $65
          local.set $69
          local.get $66
          local.set $70
          local.get $69
          local.get $70
          i32.mul
          local.get $68
          i32.add
          br $assembly/generation-kernels/index/idx|inlined.8
         end
         local.get $67
         call $~lib/staticarray/StaticArray<i32>#__uset
         i32.const 1
         local.set $6
        end
        local.get $8
        i32.const 1
        i32.add
        local.set $8
        br $while-continue|2
       end
      end
      local.get $7
      i32.const 1
      i32.add
      local.set $7
      br $while-continue|1
     end
    end
    br $while-continue|0
   end
  end
 )
 (func $assembly/generation-kernels/index/extendDeadEndsInPlace (param $0 i32) (param $1 i32) (param $2 i32) (param $3 i32)
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
  (local $30 i32)
  (local $31 i32)
  (local $32 i32)
  (local $33 i32)
  (local $34 i32)
  (local $35 i32)
  (local $36 i32)
  (local $37 i32)
  (local $38 i32)
  (local $39 i32)
  (local $40 i32)
  (local $41 i32)
  (local $42 i32)
  (local $43 i32)
  (local $44 i32)
  (local $45 i32)
  (local $46 i32)
  (local $47 i32)
  (local $48 i32)
  (local $49 i32)
  (local $50 i32)
  (local $51 i32)
  (local $52 i32)
  (local $53 i32)
  (local $54 i32)
  (local $55 i32)
  (local $56 i32)
  (local $57 i32)
  (local $58 i32)
  (local $59 i32)
  (local $60 i32)
  (local $61 i32)
  (local $62 i32)
  (local $63 i32)
  (local $64 i32)
  (local $65 i32)
  (local $66 i32)
  (local $67 i32)
  (local $68 i32)
  (local $69 i32)
  (local $70 i32)
  (local $71 i32)
  (local $72 i32)
  (local $73 i32)
  (local $74 i32)
  (local $75 i32)
  (local $76 i32)
  (local $77 i32)
  (local $78 i32)
  (local $79 i32)
  (local $80 i32)
  (local $81 i32)
  (local $82 i32)
  (local $83 i32)
  (local $84 i32)
  (local $85 i32)
  (local $86 i32)
  (local $87 i32)
  (local $88 i32)
  (local $89 i32)
  (local $90 i32)
  (local $91 i32)
  (local $92 i32)
  (local $93 i32)
  (local $94 i32)
  (local $95 i32)
  (local $96 i32)
  (local $97 i32)
  (local $98 i32)
  (local $99 i32)
  (local $100 i32)
  (local $101 i32)
  i32.const 0
  local.set $4
  i32.const 0
  local.set $5
  loop $while-continue|0
   local.get $5
   local.get $1
   i32.lt_s
   if
    i32.const 0
    local.set $6
    loop $while-continue|1
     local.get $6
     local.get $0
     i32.lt_s
     if
      block $assembly/generation-kernels/index/getCell|inlined.8 (result i32)
       local.get $6
       local.set $7
       local.get $5
       local.set $8
       local.get $0
       local.set $9
       global.get $assembly/generation-kernels/index/GRID
       block $assembly/generation-kernels/index/idx|inlined.9 (result i32)
        local.get $7
        local.set $10
        local.get $8
        local.set $11
        local.get $9
        local.set $12
        local.get $11
        local.get $12
        i32.mul
        local.get $10
        i32.add
        br $assembly/generation-kernels/index/idx|inlined.9
       end
       call $~lib/staticarray/StaticArray<i32>#__uget
       br $assembly/generation-kernels/index/getCell|inlined.8
      end
      local.get $2
      i32.eq
      if (result i32)
       block $assembly/generation-kernels/index/countPathNeighbors|inlined.0 (result i32)
        local.get $6
        local.set $13
        local.get $5
        local.set $14
        local.get $0
        local.set $15
        local.get $1
        local.set $16
        local.get $2
        local.set $17
        i32.const 0
        local.set $18
        local.get $14
        i32.const 1
        i32.add
        local.set $19
        local.get $19
        local.get $16
        i32.lt_s
        if (result i32)
         block $assembly/generation-kernels/index/getCell|inlined.9 (result i32)
          local.get $13
          local.set $20
          local.get $19
          local.set $21
          local.get $15
          local.set $22
          global.get $assembly/generation-kernels/index/GRID
          block $assembly/generation-kernels/index/idx|inlined.10 (result i32)
           local.get $20
           local.set $23
           local.get $21
           local.set $24
           local.get $22
           local.set $25
           local.get $24
           local.get $25
           i32.mul
           local.get $23
           i32.add
           br $assembly/generation-kernels/index/idx|inlined.10
          end
          call $~lib/staticarray/StaticArray<i32>#__uget
          br $assembly/generation-kernels/index/getCell|inlined.9
         end
         local.get $17
         i32.eq
        else
         i32.const 0
        end
        if
         local.get $18
         i32.const 1
         i32.add
         local.set $18
        end
        local.get $13
        i32.const 1
        i32.add
        local.set $26
        local.get $26
        local.get $15
        i32.lt_s
        if (result i32)
         block $assembly/generation-kernels/index/getCell|inlined.10 (result i32)
          local.get $26
          local.set $27
          local.get $14
          local.set $28
          local.get $15
          local.set $29
          global.get $assembly/generation-kernels/index/GRID
          block $assembly/generation-kernels/index/idx|inlined.11 (result i32)
           local.get $27
           local.set $30
           local.get $28
           local.set $31
           local.get $29
           local.set $32
           local.get $31
           local.get $32
           i32.mul
           local.get $30
           i32.add
           br $assembly/generation-kernels/index/idx|inlined.11
          end
          call $~lib/staticarray/StaticArray<i32>#__uget
          br $assembly/generation-kernels/index/getCell|inlined.10
         end
         local.get $17
         i32.eq
        else
         i32.const 0
        end
        if
         local.get $18
         i32.const 1
         i32.add
         local.set $18
        end
        local.get $14
        i32.const 1
        i32.sub
        local.set $33
        local.get $33
        i32.const 0
        i32.ge_s
        if (result i32)
         block $assembly/generation-kernels/index/getCell|inlined.11 (result i32)
          local.get $13
          local.set $34
          local.get $33
          local.set $35
          local.get $15
          local.set $36
          global.get $assembly/generation-kernels/index/GRID
          block $assembly/generation-kernels/index/idx|inlined.12 (result i32)
           local.get $34
           local.set $37
           local.get $35
           local.set $38
           local.get $36
           local.set $39
           local.get $38
           local.get $39
           i32.mul
           local.get $37
           i32.add
           br $assembly/generation-kernels/index/idx|inlined.12
          end
          call $~lib/staticarray/StaticArray<i32>#__uget
          br $assembly/generation-kernels/index/getCell|inlined.11
         end
         local.get $17
         i32.eq
        else
         i32.const 0
        end
        if
         local.get $18
         i32.const 1
         i32.add
         local.set $18
        end
        local.get $13
        i32.const 1
        i32.sub
        local.set $40
        local.get $40
        i32.const 0
        i32.ge_s
        if (result i32)
         block $assembly/generation-kernels/index/getCell|inlined.12 (result i32)
          local.get $40
          local.set $41
          local.get $14
          local.set $42
          local.get $15
          local.set $43
          global.get $assembly/generation-kernels/index/GRID
          block $assembly/generation-kernels/index/idx|inlined.13 (result i32)
           local.get $41
           local.set $44
           local.get $42
           local.set $45
           local.get $43
           local.set $46
           local.get $45
           local.get $46
           i32.mul
           local.get $44
           i32.add
           br $assembly/generation-kernels/index/idx|inlined.13
          end
          call $~lib/staticarray/StaticArray<i32>#__uget
          br $assembly/generation-kernels/index/getCell|inlined.12
         end
         local.get $17
         i32.eq
        else
         i32.const 0
        end
        if
         local.get $18
         i32.const 1
         i32.add
         local.set $18
        end
        local.get $18
        br $assembly/generation-kernels/index/countPathNeighbors|inlined.0
       end
       i32.const 1
       i32.eq
      else
       i32.const 0
      end
      if
       global.get $assembly/generation-kernels/index/DEAD_ENDS
       local.get $4
       block $assembly/generation-kernels/index/idx|inlined.14 (result i32)
        local.get $6
        local.set $47
        local.get $5
        local.set $48
        local.get $0
        local.set $49
        local.get $48
        local.get $49
        i32.mul
        local.get $47
        i32.add
        br $assembly/generation-kernels/index/idx|inlined.14
       end
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
      br $while-continue|1
     end
    end
    local.get $5
    i32.const 1
    i32.add
    local.set $5
    br $while-continue|0
   end
  end
  i32.const 0
  local.set $50
  loop $while-continue|2
   local.get $50
   local.get $4
   i32.lt_s
   if
    global.get $assembly/generation-kernels/index/DEAD_ENDS
    local.get $50
    call $~lib/staticarray/StaticArray<i32>#__uget
    local.set $51
    local.get $51
    local.get $0
    i32.rem_s
    local.set $52
    local.get $51
    local.get $0
    i32.div_s
    local.set $53
    local.get $52
    local.set $54
    local.get $53
    local.set $55
    i32.const -1
    local.set $56
    i32.const -1
    local.set $57
    local.get $53
    i32.const 1
    i32.add
    local.get $1
    i32.lt_s
    if (result i32)
     block $assembly/generation-kernels/index/getCell|inlined.13 (result i32)
      local.get $52
      local.set $58
      local.get $53
      i32.const 1
      i32.add
      local.set $59
      local.get $0
      local.set $60
      global.get $assembly/generation-kernels/index/GRID
      block $assembly/generation-kernels/index/idx|inlined.15 (result i32)
       local.get $58
       local.set $61
       local.get $59
       local.set $62
       local.get $60
       local.set $63
       local.get $62
       local.get $63
       i32.mul
       local.get $61
       i32.add
       br $assembly/generation-kernels/index/idx|inlined.15
      end
      call $~lib/staticarray/StaticArray<i32>#__uget
      br $assembly/generation-kernels/index/getCell|inlined.13
     end
     local.get $2
     i32.eq
    else
     i32.const 0
    end
    if
     local.get $52
     local.set $56
     local.get $53
     i32.const 1
     i32.add
     local.set $57
    end
    local.get $56
    i32.const -1
    i32.eq
    if (result i32)
     local.get $52
     i32.const 1
     i32.add
     local.get $0
     i32.lt_s
    else
     i32.const 0
    end
    if (result i32)
     block $assembly/generation-kernels/index/getCell|inlined.14 (result i32)
      local.get $52
      i32.const 1
      i32.add
      local.set $64
      local.get $53
      local.set $65
      local.get $0
      local.set $66
      global.get $assembly/generation-kernels/index/GRID
      block $assembly/generation-kernels/index/idx|inlined.16 (result i32)
       local.get $64
       local.set $67
       local.get $65
       local.set $68
       local.get $66
       local.set $69
       local.get $68
       local.get $69
       i32.mul
       local.get $67
       i32.add
       br $assembly/generation-kernels/index/idx|inlined.16
      end
      call $~lib/staticarray/StaticArray<i32>#__uget
      br $assembly/generation-kernels/index/getCell|inlined.14
     end
     local.get $2
     i32.eq
    else
     i32.const 0
    end
    if
     local.get $52
     i32.const 1
     i32.add
     local.set $56
     local.get $53
     local.set $57
    end
    local.get $56
    i32.const -1
    i32.eq
    if (result i32)
     local.get $53
     i32.const 1
     i32.sub
     i32.const 0
     i32.ge_s
    else
     i32.const 0
    end
    if (result i32)
     block $assembly/generation-kernels/index/getCell|inlined.15 (result i32)
      local.get $52
      local.set $70
      local.get $53
      i32.const 1
      i32.sub
      local.set $71
      local.get $0
      local.set $72
      global.get $assembly/generation-kernels/index/GRID
      block $assembly/generation-kernels/index/idx|inlined.17 (result i32)
       local.get $70
       local.set $73
       local.get $71
       local.set $74
       local.get $72
       local.set $75
       local.get $74
       local.get $75
       i32.mul
       local.get $73
       i32.add
       br $assembly/generation-kernels/index/idx|inlined.17
      end
      call $~lib/staticarray/StaticArray<i32>#__uget
      br $assembly/generation-kernels/index/getCell|inlined.15
     end
     local.get $2
     i32.eq
    else
     i32.const 0
    end
    if
     local.get $52
     local.set $56
     local.get $53
     i32.const 1
     i32.sub
     local.set $57
    end
    local.get $56
    i32.const -1
    i32.eq
    if (result i32)
     local.get $52
     i32.const 1
     i32.sub
     i32.const 0
     i32.ge_s
    else
     i32.const 0
    end
    if (result i32)
     block $assembly/generation-kernels/index/getCell|inlined.16 (result i32)
      local.get $52
      i32.const 1
      i32.sub
      local.set $76
      local.get $53
      local.set $77
      local.get $0
      local.set $78
      global.get $assembly/generation-kernels/index/GRID
      block $assembly/generation-kernels/index/idx|inlined.18 (result i32)
       local.get $76
       local.set $79
       local.get $77
       local.set $80
       local.get $78
       local.set $81
       local.get $80
       local.get $81
       i32.mul
       local.get $79
       i32.add
       br $assembly/generation-kernels/index/idx|inlined.18
      end
      call $~lib/staticarray/StaticArray<i32>#__uget
      br $assembly/generation-kernels/index/getCell|inlined.16
     end
     local.get $2
     i32.eq
    else
     i32.const 0
    end
    if
     local.get $52
     i32.const 1
     i32.sub
     local.set $56
     local.get $53
     local.set $57
    end
    local.get $56
    i32.const -1
    i32.ne
    if
     local.get $52
     local.get $56
     i32.sub
     local.set $82
     local.get $53
     local.get $57
     i32.sub
     local.set $83
     local.get $52
     local.get $82
     i32.add
     local.set $54
     local.get $53
     local.get $83
     i32.add
     local.set $55
     i32.const 0
     local.set $84
     block $while-break|3
      loop $while-continue|3
       local.get $84
       local.get $3
       i32.lt_s
       if
        block $assembly/generation-kernels/index/inBounds|inlined.0 (result i32)
         local.get $54
         local.set $85
         local.get $55
         local.set $86
         local.get $0
         local.set $87
         local.get $1
         local.set $88
         local.get $85
         i32.const 0
         i32.ge_s
         if (result i32)
          local.get $85
          local.get $87
          i32.lt_s
         else
          i32.const 0
         end
         if (result i32)
          local.get $86
          i32.const 0
          i32.ge_s
         else
          i32.const 0
         end
         if (result i32)
          local.get $86
          local.get $88
          i32.lt_s
         else
          i32.const 0
         end
         br $assembly/generation-kernels/index/inBounds|inlined.0
        end
        i32.eqz
        if
         br $while-break|3
        end
        block $assembly/generation-kernels/index/getCell|inlined.17 (result i32)
         local.get $54
         local.set $89
         local.get $55
         local.set $90
         local.get $0
         local.set $91
         global.get $assembly/generation-kernels/index/GRID
         block $assembly/generation-kernels/index/idx|inlined.19 (result i32)
          local.get $89
          local.set $92
          local.get $90
          local.set $93
          local.get $91
          local.set $94
          local.get $93
          local.get $94
          i32.mul
          local.get $92
          i32.add
          br $assembly/generation-kernels/index/idx|inlined.19
         end
         call $~lib/staticarray/StaticArray<i32>#__uget
         br $assembly/generation-kernels/index/getCell|inlined.17
        end
        local.get $2
        i32.eq
        if
         br $while-break|3
        end
        local.get $54
        local.set $95
        local.get $55
        local.set $96
        local.get $0
        local.set $97
        local.get $2
        local.set $98
        global.get $assembly/generation-kernels/index/GRID
        block $assembly/generation-kernels/index/idx|inlined.20 (result i32)
         local.get $95
         local.set $99
         local.get $96
         local.set $100
         local.get $97
         local.set $101
         local.get $100
         local.get $101
         i32.mul
         local.get $99
         i32.add
         br $assembly/generation-kernels/index/idx|inlined.20
        end
        local.get $98
        call $~lib/staticarray/StaticArray<i32>#__uset
        local.get $54
        local.get $82
        i32.add
        local.set $54
        local.get $55
        local.get $83
        i32.add
        local.set $55
        local.get $84
        i32.const 1
        i32.add
        local.set $84
        br $while-continue|3
       end
      end
     end
    end
    local.get $50
    i32.const 1
    i32.add
    local.set $50
    br $while-continue|2
   end
  end
 )
 (func $~start
  call $start:assembly/generation-kernels/index
 )
)
