import XXH from 'xxhashjs'

/**
 * Generates pseudo-random numbers using the xxHash algorithm.
 * @module prng-xxhash
 */

/**
 * The maximum limit of unsigned 32 bit integers, which is `2^32 - 1`. It used to convert random bits to numbers.
 * @const {number}
 */
const UINT32_MAX_VALUE = Math.pow(2, 32) - 1

/** Class generating pseudo-random numbers using the xxHash algorithm. */
export class Generator {
  _xxh
  /**
   * The internal seed value of the generator.
   *
   * In xxHash, this is the `data` parameter. xxHash is a hashing function after all.
   *
   * @private {string}
   */
  _seed
  /**
   * The internal offset value of the generator.
   *
   * In xxHash, this is the `seed` parameter.
   *
   * @private {number}
   */
  _offset
  /**
   * Creates a `prng-xxh` generator object.
   * @param  {string|ArrayBuffer} seed Seed that the pseudo-random numbers are generated from.
   * @param  {number} offset = 0       Generates a different batch of pseudo-random numbers from the seed.
   * Please note that setting an offset is a deterministic and random-access manner of
   * choosing different chains of pseudo-random numbers given a seed.
   * Offset is sort of an index on an array of all possible chains of pseudo-random numbers generated from a seed.
   * But the chain of pseudo-random numbers generated given a particular seed and an offset cannot be accessed randomly,
   * only sequentially. The offset does not refer to an index within this chain.
   */
  constructor (seed, offset = 0) {
    this._seed = typeof seed === 'string' ? seed : seed instanceof ArrayBuffer ? seed : seed.toString()
    this._offset = offset
    this._xxh = new XXH(this._offset).update(this._seed)
  }
  /**
   * The seed value of the generator.
   * @const {string}
   */
  get seed () { return this._seed }
  /**
   * The offset value of the generator.
   * @const {number}
   */
  get offset () { return this._offset }
  /**
   * Generate the next single pseudo-random signed 32-bit number or an array thereof.
   *
   * The generated bits are well-suited for use with bitwise operators.
   *
   * @param  {number} n = null      If provided, generates that many pseudo-random numbers. Generates a single number by default.
   * @return {number|number[]}      The next random number, or an array of next pseudo-random numbers.
   *
   * @example
   * let g = new Generator('foo')
   * let r = g.randomBits() // 11100010000011110000110111011001
   * r & 0b0100 > 0 // false
   * r & 0b1000 > 0 // true
   */
  randomBits (n = null) {
    if (n === null) return this._xxh.digest()
    else return new Array(n).fill(0).map(() => this._xxh.digest())
  }
  /**
   * Generate the next single pseudo-random number or an array thereof.
   *
   * @param  {number} [n]           If provided, generates that many pseudo-random numbers. Generates a single number by default.
   * @return {number|number[]}      The next random number, or an array of next pseudo-random numbers.
   *
   * @example
   * let g = new Generator('foo')
   * g.random() // 0.8830422074261686
   */
  random (n = null) {
    if (n === null) return (this.randomBits(n) >>> 0) / UINT32_MAX_VALUE
    else return this.randomBits(n).map((x) => (x >>> 0) / UINT32_MAX_VALUE)
  }
  /**
   * Resets the chain of generated pseudo-random numbers.
   *
   * @return
   *
   * @example
   * let g = new Generator('foo')
   * g.random() // 0.8830422074261686
   * g.random() // 0.389555073899579
   * g.reset()
   * g.randomBits() // 0.8830422074261686
   */
  reset () {
    this._xxh.init(this._offset).update(this._seed)
    return this
  }
}

/**
 * Creates a generator object that generates pseudo-random signed 32-bit integers using the xxHash algorithm.
 *
 * The `value` property returned by the `next()` method is the generated pseudo-random number. See {@link Generator#randomBits}.
 * Calling `next()` with `true` resets the generator object. See {@link Generator#reset}.
 *
 * @param  {string|ArrayBuffer} seed Seed that the pseudo-random numbers are generated from.
 * @param  {number} offset = 0       Generates a different batch of pseudo-random numbers from the seed.
 * @return {generator}
 */
export function * randomBitsGenerator (seed, offset = 0) {
  let g = new Generator(seed, offset)
  while (true) if ((yield g.randomBits()) === true) g.reset()
}

/**
 * Creates a generator object that generates pseudo-random numbers using the xxHash algorithm.
 *
 * The `value` property returned by the `next()` method is the generated pseudo-random number. See {@link Generator#random}.
 * Calling `next()` with `true` resets the generator object. See {@link Generator#reset}.
 *
 * @see    {@link Generator}
 *
 * @param  {string|ArrayBuffer} seed Seed that the pseudo-random numbers are generated from.
 * @param  {number} offset = 0       Generates a different batch of pseudo-random numbers from the seed.
 * @return {generator}
 */
export function * randomGenerator (seed, offset = 0) {
  let g = new Generator(seed, offset)
  while (true) if ((yield g.random()) === true) g.reset()
}

/**
 * Generates pseudo-random signed 32-bit integers using the xxHash algorithm.
 *
 * Please bear in mind that calling this shorthand function instantiates a new {@link Generator} instance every time.
 * If the use-case is to generate a series of pseudo-random numbers at a time, it is advised to generate them
 * with a single call, or with a persistent {@link Generator} instance, or {@link randomBitsGenerator} object.
 * This process is significantly faster than calling this shorthand multiple times and incrementing the offset property.
 *
 * Also see the note about the offset parameter on {@link Generator#constructor}.
 *
 * @see    {@link Generator#randomBits}
 * @param  {string|ArrayBuffer} seed Seed that the pseudo-random numbers are generated from.
 * @param  {number} offset = 0       Generates a different batch of pseudo-random numbers from the seed.
 * @param  {number} n = null      If provided, generates that many pseudo-random numbers. Generates a single number by default.
 * @return {number|number[]}         The next random number, or an array of next pseudo-random numbers.
 */
export function randomBits (seed, offset = 0, n = null) {
  return new Generator(seed, offset).randomBits(n)
}

/**
 * Generates pseudo-random numbers using the xxHash algorithm.
 *
 * Please bear in mind that calling this shorthand function instantiates a new {@link Generator} instance every time.
 * If the use-case is to generate a series of pseudo-random numbers at a time, it is advised to generate them
 * with a single call, or with a persistent {@link Generator} instance, or {@link randomGenerator} object.
 * This process is significantly faster than calling this shorthand multiple times and incrementing the offset property.
 *
 * Also see the note about the offset parameter on {@link Generator#constructor}.
 *
 * @see    {@link Generator#random}
 * @param  {string|ArrayBuffer} seed Seed that the pseudo-random numbers are generated from.
 * @param  {number} offset = 0       Generates a different batch of pseudo-random numbers from the seed.
 * @param  {number} n = null      If provided, generates that many pseudo-random numbers. Generates a single number by default.
 * @return {number|number[]}         The next random number, or an array of next pseudo-random numbers.
 */
export function random (seed, offset = 0, n = null) {
  return new Generator(seed, offset).random(n)
}

export default random
