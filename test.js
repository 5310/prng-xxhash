import {Generator, randomGenerator, random} from './prng-xxhash'
import assert from 'assert'

assert.equal(new Generator('foo').random(), 0.8830422074261686)
assert.notEqual(new Generator('foo').random(), new Generator('bar').random())

assert.equal(new Generator('foo', 0).random(), new Generator('foo').random())
assert.notEqual(new Generator('foo', 0).random(), new Generator('foo', 1).random())

{
  let g = new Generator('foo')
  assert.deepEqual(
    new Array(5).fill(0).map((_) => g.random()),
    [
      0.8830422074261686,
      0.389555073899579,
      0.08511425323903427,
      0.04387996672742999,
      0.6582458847337975
    ]
  )
  g.reset()
  assert.deepEqual(
    new Array(5).fill(0).map((_) => g.random()),
    [
      0.8830422074261686,
      0.389555073899579,
      0.08511425323903427,
      0.04387996672742999,
      0.6582458847337975
    ]
  )
}

{
  let gi = new Generator('foo')
  let go = randomGenerator('foo')
  assert.deepEqual(
    new Array(5).fill(0).map((_) => go.next().value),
    new Array(5).fill(0).map((_) => gi.random())
  )
  gi.reset()
  assert.deepEqual(
    new Array(5).fill(0).map((_, i) => go.next(i === 0).value),
    new Array(5).fill(0).map((_) => gi.random())
  )
}

{
  let g = new Generator('foo')
  assert.deepEqual(
    random('foo', 0, 5),
    new Array(5).fill(0).map((_) => g.random())
  )
}

console.log('Tested ok.')
