/**
 * Represents a generic array type that requires at least one element.
 *
 * @example
 * let arr: NonEmptyArray<number> = [1, 2, 3]; // This is fine.
 * arr = []; // This causes a type error.
 *
 * @template T - The type of elements in the array.
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Checks whether a given array is non-empty.
 *
 * @example
 * const arr: number[] = [1, 2, 3];
 * if (isNonEmptyArray(arr)) {
 *    console.log("Non-empty array:", arr);
 * } else {
 *    console.log("Empty array");
 * }
 *
 * @template T - The type of elements in the input array.
 * @param {T[]} arr - An array to be checked.
 * @returns {boolean} - Returns true if the array has at least one element, false otherwise.
 */
export function isNonEmptyArray<T>(arr: T[]): arr is NonEmptyArray<T> {
	return arr.length > 0;
}

/**
 * Creates a range of numbers between two provided values, or from 0 to a single provided value.
 *
 * @example
 * range(5); // Returns [0, 1, 2, 3, 4]
 * range(3, 5); // Returns [3, 4]
 *
 * @param {number} arg1 - The start or end of the range depending on whether arg2 is defined.
 * @param {number} [arg2] - The end of the range. If not defined, arg1 is taken as end and start is 0.
 * @returns {Array<number>} - An array of numbers in the specified range.
 */
export function range(arg1: number, arg2: number | undefined = undefined): Array<number> {
	let start: number, end: number;
	if (arg2 !== undefined) {
		start = arg1;
		end = arg2;
	} else {
		start = 0;
		end = arg1;
	}

	if (end < start) {
		// Create array for descending ranges
		const result = [];
		for (let i = start; i > end; i--) {
			result.push(i);
		}
		return result;
	}

	// Create array for ascending ranges
	const result = [];
	for (let i = start; i < end; i++) {
		result.push(i);
	}
	return result;
}

type Zip<T extends unknown[][]> = {
	[K in keyof T]: T[K] extends (infer U)[] ? U : never;
}[];

/**
 * Zips together multiple lists into a single list of tuples.
 *
 * @example
 * zip([[1,2,3], ['a','b','c']]); // Returns [[1, 'a'], [2, 'b'], [3, 'c']]
 *
 * @template T - The type of elements in the input lists.
 * @param {T[][]} lsts - An array of arrays to be zipped.
 * @returns {Array<Array<T>>} - An array of tuples where each tuple contains elements at corresponding indices from the input arrays.
 * @throws {string} If minimum length of input arrays cannot be determined.
 */
export function zip<T extends unknown[][]>(lsts: [...T]): Zip<T> {
	if (lsts.length === 0) {
		return [];
	}

	let minLength = lsts[0].length;
	for (let i = 1; i < lsts.length; i++) {
		if (lsts[i].length < minLength) {
			minLength = lsts[i].length;
		}
	}

	const result: unknown[][] = [];
	for (let i = 0; i < minLength; i++) {
		result.push(lsts.map((lst) => lst[i]));
	}

	return result as Zip<T>;
}

/**
 * Cycles the elements in an array in the specified direction by the given amount.
 *
 * @example
 * cycle([1, 2, 3, 4], 2, 'left'); // Returns [3, 4, 1, 2]
 * cycle([1, 2, 3, 4], 1, 'right'); // Returns [4, 1, 2, 3]
 *
 * @template T - The type of elements in the array.
 * @param {T[]} arr - The array to cycle.
 * @param {number} n - The number of positions to cycle the array.
 * @param {'left' | 'right'} direction - The direction to cycle the array, either "left" or "right".
 * @returns {T[]} - A new array with elements cycled.
 * @throws {Error} If the direction is neither 'left' nor 'right'.
 */
export function cycle<T>(arr: T[], n: number, direction: 'left' | 'right'): T[] {
	const len = arr.length;
	if (len === 0) {
		return [];
	}
	
	n = n % len;
	if (direction === 'right') {
		n = len - n;
	}

	// Slice, concat, voila!
	return arr.slice(n).concat(arr.slice(0, n));
}


/**
 * Returns the value of a global variable if it exists, or undefined if it does not.
 *
 * @example
 * maybe_global('window'); // Returns the value of the global variable 'window' if it exists, or undefined if it does not.
 *
 * @template K - The name of the global variable to check.
 * @param {K} name - The name of the global variable to check.
 * @returns {(typeof globalThis)[K] | undefined | unknown} - The value of the global variable if it exists, or undefined if it does not. If the name doesn't match any global variables, returns unknown.
 */
export function maybe_global<K extends string>(
	name: K
): K extends keyof typeof globalThis ? (typeof globalThis)[K] | undefined : unknown {
	return has_property(globalThis, name) ? globalThis[name as keyof typeof globalThis] : undefined;
}

/**
 * Pairs the consecutive elements of a given list.
 *
 * @example
 * pairs([1, 2, 3, 4]); // Returns [[1, 2], [2, 3], [3, 4]]
 *
 * @template T - The type of elements in the input list.
 * @param {T[]} lst - An array to be paired.
 * @returns {[T, T][]} - An array of tuples where each tuple contains two consecutive elements from the input array.
 */
export function pairs<T>(lst: T[]): [T, T][] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return zip([lst.slice(0, -1), lst.slice(1)]) as any;
}

type ArrayType<T, D extends readonly unknown[]> = D extends readonly []
	? T
	: // eslint-disable-next-line @typescript-eslint/no-unused-vars
	D extends readonly [infer _, ...infer R]
	? ArrayType<T[], R>
	: never;

/**
 * Initializes a multi-dimensional array with the specified dimensions and initial value.
 *
 * @example
 * init_array(0, [2, 3]); // Returns [[0, 0, 0], [0, 0, 0]]
 *
 * @template T - The type of the initial value and elements in the output array.
 * @template D - The type of dimensions as an array of numbers.
 * @param {T} initValue - The initial value to be set for each element of the array.
 * @param {D} dimensions - An array representing the dimensions of the output array.
 * @returns {ArrayType<T, D>} - A multi-dimensional array of the given dimensions filled with the initial value.
 */
export function init_array<T, D extends readonly number[]>(
	initValue: T,
	dimensions: readonly [...D]
): ArrayType<T, D> {
	if (dimensions.length === 0) {
		return initValue as ArrayType<T, D>;
	}

	const [first, ...rest] = dimensions;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: any[] = [];

	for (let i = 0; i < first; i++) {
		result.push(init_array(initValue, rest));
	}

	return result as ArrayType<T, D>;
}

const cache = new Map<string, unknown>();
export function cached<T>(func: () => T, key: string): T {
	if (cache.has(key)) {
		return cache.get(key) as T;
	} else {
		const result = func();
		cache.set(key, result);
		return result;
	}
}

/**
 * Cyclically pairs the elements of a given list.
 *
 * @example
 * cyclic_pairs([1, 2, 3, 4]); // Returns [[1, 2], [2, 3], [3, 4], [4, 1]]
 *
 * @template T - The type of elements in the input list.
 * @param {T[]} lst - An array to be cyclically paired.
 * @returns {[T, T][]} - An array of tuples where each tuple contains two consecutive elements from the input array, including a pair of the last and first elements.
 */
export function cyclic_pairs<T>(lst: T[]): [T, T][] {
	if (lst.length === 0) {
		return [];
	}
	return pairs(lst.concat(lst[0]));
}

/**
 * Updates an object property if the new value is truthy, otherwise deletes the property.
 *
 * @example
 * let obj = { key: "value" };
 * object_assign_if_truthy(obj, "key", false); // obj becomes {}
 *
 * @template T - The type of the property value.
 * @param {Record<PropertyKey, T>} obj - The object to update.
 * @param {symbol | number | string} key - The property key.
 * @param {T} value - The new value.
 * @returns {void}
 */
export function object_assign_if_truthy<T>(
	obj: Record<PropertyKey, T>,
	key: symbol | number | string,
	value: T
) {
	if (value) {
		obj[key] = value;
	} else {
		delete obj[key];
	}
}

/**
 * Folds a list of values into a single value using a provided reducer function.
 *
 * @example
 * fold(0, [1, 2, 3, 4, 5], (sum, val) => sum + val); // Returns 15
 *
 * @template A - The type of the initial and final value.
 * @template B - The type of the list values.
 * @param {A} value - The initial value.
 * @param {B[]} values - The list of values to fold.
 * @param {(value: A, value2: B) => A} func - The reducer function.
 * @returns {A} - The final value after applying the reducer to all values.
 */
export function fold<A, B>(value: A, values: Array<B>, func: (value: A, value2: B) => A): A {
	values.forEach((value2) => {
		value = func(value, value2);
	});
	return value;
}

/**
 * Applies a list of functions to a single value.
 *
 * @example
 * apply(2, [[3, (a, b) => a * b], [5, (a, b) => a - b]]); // Returns 1
 *
 * @template A - The type of the initial and final value.
 * @template B - The type of the additional parameter for each function.
 * @param {A} value - The initial value.
 * @param {Array<[B, (value: A, value2: B) => A]>} values - The list of functions with their additional parameters.
 * @returns {A} - The final value after applying all functions.
 */
export function apply<A, B>(value: A, values: Array<[B, (value: A, value2: B) => A]>): A {
	values.forEach(([value2, func]) => {
		value = func(value, value2);
	});
	return value;
}

/**
 * Extracts the keys from an object with the keys coerced into type `K`.
 *
 * @example
 * typed_keys({ a: 1, b: 2 }); // Returns ["a", "b"]
 *
 * @template K - The type of the keys.
 * @param {Record<K, unknown>} obj - The object from which to extract keys.
 * @returns {Array<K>} - An array of keys from the object.
 */
export function typed_keys<K extends string>(obj: Record<K, unknown>): Array<K> {
	return Object.keys(obj) as Array<K>;
}

/**
 * Extracts the keys from an object with the keys coerced into type `K` and parsed to numbers.
 *
 * @example
 * typed_number_keys({ '1': "a", '2': "b" }); // Returns [1, 2]
 *
 * @template K - The type of the keys.
 * @param {Record<K, unknown>} obj - The object from which to extract keys.
 * @returns {K[]} - An array of keys from the object, parsed to numbers.
 */
export function typed_number_keys<K extends number>(obj: Record<K, unknown>): K[] {
	return Object.keys(obj).map((v) => Number.parseFloat(v)) as K[];
}

/**
 * Extracts entries from an object with the entries coerced into type `[K, V]`.
 *
 * @example
 * typed_entries({ a: 1, b: 2 }); // Returns [["a", 1], ["b", 2]]
 *
 * @template K - The type of the keys.
 * @template V - The type of the values.
 * @param {Partial<Record<K, V>>} obj - The object from which to extract entries.
 * @returns {Array<[K, V]>} - An array of entries from the object.
 */
export function typed_entries<K extends string, V>(obj: Partial<Record<K, V>>): Array<[K, V]> {
	return Object.entries(obj) as Array<[K, V]>;
}

/**
 * Coerces the keys of the entries in an object into numbers, and returns a typed array of entries.
 *
 * @example
 * typed_number_entries({ '1': "a", '2': "b" }); // Returns [[1, "a"], [2, "b"]]
 *
 * @template K - The type of the keys.
 * @template V - The type of the values.
 * @param {Partial<Record<K, V>>} obj - The object from which to extract entries.
 * @returns {Array<[K, V]>} - An array of entries from the object with keys parsed to numbers.
 */
export function typed_number_entries<K extends number, V>(
	obj: Partial<Record<K, V>>
): Array<[K, V]> {
	return Object.entries(obj).map(([k, v]) => [Number.parseFloat(k), v]) as Array<[K, V]>;
}

/**
 * Converts an array of entries into an object with typed keys and values.
 *
 * @example
 * typed_from_entries([["a", 1], ["b", 2]]); // Returns { a: 1, b: 2 }
 *
 * @template K - The type of the keys.
 * @template V - The type of the values.
 * @param {Array<[K, V]>} values - The array of entries to convert.
 * @returns {Record<K, V>} - The resulting object.
 */
export function typed_from_entries<K extends PropertyKey, V>(values: [K, V][]): Record<K, V> {
	return Object.fromEntries(values) as Record<K, V>;
}

/**
 * Converts an object with nullable values into one with non-nullable values, excluding any keys that had null or undefined values.
 *
 * @example
 * nullableobj_to_partial({ a: 1, b: null, c: undefined, d: 2 }); // Returns { a: 1, d: 2 }
 *
 * @template K - The type of the keys.
 * @template V - The type of the values.
 * @param {Record<K, V | null | undefined>} obj - The object to convert.
 * @returns {Record<K, V>} - The resulting object.
 */
export function nullableobj_to_partial<K extends string, V>(
	obj: Record<K, V | null | undefined>
): Record<K, V> {
	return typed_from_entries(
		typed_entries(obj).filter(([, v]) => ((v ?? null) === null ? false : true))
	) as Record<K, V>;
}

/**
 * Creates a new object by applying a function to the keys of an existing object.
 *
 * @example
 * map_keys({ a: 1, b: 2 }, key => key + key); // Returns { aa: 1, bb: 2 }
 *
 * @template K - The type of the original keys.
 * @template V - The type of the values.
 * @template NK - The type of the new keys.
 * @param {Record<K, V>} obj - The object to use as input.
 * @param {(v: K) => NK} func - The function to apply to the keys.
 * @returns {Record<NK, V>} - The resulting object.
 */
export function map_keys<K extends string, V, NK extends string>(
	obj: Record<K, V>,
	func: (v: K) => NK
): Record<NK, V> {
	return typed_from_entries(typed_entries<K, V>(obj).map(([k, v]) => [func(k), v]));
}

/**
 * Creates a new object by applying a function to the keys of an existing object where keys are numbers.
 *
 * @example
 * map_number_keys({ 1: "a", 2: "b" }, key => key + key); // Returns { 2: "a", 4: "b" }
 *
 * @template K - The type of the original keys.
 * @template V - The type of the values.
 * @template NK - The type of the new keys.
 * @param {Record<K, V>} obj - The object to use as input.
 * @param {(v: K) => NK} func - The function to apply to the keys.
 * @returns {Record<NK, V>} - The resulting object.
 */
export function map_number_keys<K extends number, V, NK extends PropertyKey>(
	obj: Record<K, V>,
	func: (v: K) => NK
): Record<NK, V> {
	return typed_from_entries(typed_number_entries<K, V>(obj).map(([k, v]) => [func(k), v]));
}

/**
 * Creates a new object by applying a function to the values of an existing object.
 *
 * @example
 * map_values({ a: 1, b: 2 }, value => value * value); // Returns { a: 1, b: 4 }
 *
 * @template K - The type of the keys.
 * @template V - The type of the original values.
 * @template NV - The type of the new values.
 * @param {Record<K, V>} obj - The object to use as input.
 * @param {(v: V) => NV} func - The function to apply to the values.
 * @returns {Record<K, NV>} - The resulting object.
 */
export function map_values<K extends string, V, NV>(
	obj: Record<K, V>,
	func: (v: V) => NV
): Record<K, NV> {
	return typed_from_entries(typed_entries<K, V>(obj).map(([k, v]) => [k, func(v)]));
}

/**
 * Creates a new object by applying a function to the entries of an existing object.
 *
 * @example
 * map_entries({ a: 1, b: 2 }, ([k, v]) => [k + k, v * v]); // Returns { aa: 1, bb: 4 }
 *
 * @template K - The type of the original keys.
 * @template V - The type of the original values.
 * @template NK - The type of the new keys.
 * @template NV - The type of the new values.
 * @param {Record<K, V>} obj - The object to use as input.
 * @param {(entries: [K, V]) => [NK, NV]} func - The function to apply to the entries.
 * @returns {Record<NK, NV>} - The resulting object.
 */
export function map_entries<K extends string, V, NK extends PropertyKey, NV>(
	obj: Record<K, V>,
	func: (entries: [K, V]) => [NK, NV]
): Record<NK, NV> {
	return typed_from_entries(typed_entries<K, V>(obj).map((entry) => func(entry)));
}

/**
 * Creates a new object by applying a function to the entries of an existing object where keys are numbers.
 *
 * @example
 * map_number_entries({ 1: "a", 2: "b" }, ([k, v]) => [k + k, v + v]); // Returns { 2: "aa", 4: "bb" }
 *
 * @template K - The type of the original keys.
 * @template V - The type of the original values.
 * @template NK - The type of the new keys.
 * @template NV - The type of the new values.
 * @param {Record<K, V>} obj - The object to use as input.
 * @param {(entries: [K, V]) => [NK, NV]} func - The function to apply to the entries.
 * @returns {Record<NK, NV>} - The resulting object.
 */
export function map_number_entries<K extends number, V, NK extends PropertyKey, NV>(
	obj: Record<K, V>,
	func: (entries: [K, V]) => [NK, NV]
): Record<NK, NV> {
	return typed_from_entries(typed_number_entries<K, V>(obj).map((entry) => func(entry)));
}

/**
 * Overlays properties from one object onto another, based on a template object.
 *
 * @example
 * const template = { a: 1, b: 2, c: 3 };
 * const obj = { a: 10, c: 30 };
 * cover(template, obj); // Returns { a: 10, b: 2, c: 30 }
 *
 * @template T - The type of the template object.
 * @param {T} template - The template object.
 * @param {Partial<T>} obj - The object with properties to overlay onto the template.
 * @returns {T} - The resulting object.
 */
export function cover<T extends Record<string, unknown>>(template: T, obj: Partial<T>): T {
	return map_entries(template, ([k, v]) => {
		if (k in obj) {
			return [k, obj[k]];
		} else {
			return [k, v];
		}
	}) as T;
}

/**
 * Applies a function to a value and returns the original value.
 *
 * @example
 * const value = 5;
 * const newValue = pass_back(value, (v) => console.log(v * v)); // Logs 25 and returns 5
 *
 * @template A - The type of the value.
 * @param {A} value - The value to use.
 * @param {(v: A) => any} func - The function to apply to the value.
 * @returns {A} - The original value.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pass_back<A>(value: A, func: (v: A) => any): A {
	func(value);
	return value;
}

/**
 * Joins an array of strings into one string with a default separator and a final separator.
 *
 * @example
 * const arr = ['Apple', 'Banana', 'Cherry'];
 * final_join(arr, ', ', ' and '); // Returns 'Apple, Banana and Cherry'
 *
 * @param {ReadonlyArray<string>} lst - The array of strings to join.
 * @param {string} default_seperator - The separator to use between all elements except the last two.
 * @param {string} final_seperator - The separator to use between the last two elements.
 * @returns {string} - The resulting string.
 */
export function final_join(
	lst: ReadonlyArray<string>,
	default_seperator: string,
	final_seperator: string
): string {
	if (lst.length === 1) {
		return lst[0];
	} else if (lst.length === 0) {
		return '';
	} else {
		return (
			(lst.length === 2 ? '' : lst.slice(0, -2).join(default_seperator) + default_seperator) +
			lst.slice(-2).join(final_seperator)
		);
	}
}

/**
 * Checks if an object has a certain property.
 *
 * @example
 * const obj = { a: 1, b: 2 };
 * has_property(obj, 'a'); // Returns true
 * has_property(obj, 'b'); // Returns true
 * has_property(obj, 'c'); // Returns false
 *
 * // Edge Cases:
 * // When object is null
 * has_property(null, 'a'); // Returns false
 *
 * // When object is undefined
 * has_property(undefined, 'a'); // Returns false
 *
 * // When property is in object's prototype chain
 * const protoObj = Object.create({ protoProp: 'exists' });
 * has_property(protoObj, 'protoProp'); // Returns true
 *
 * // When object is an array
 * const arr = ['a', 'b', 'c'];
 * has_property(arr, 0); // Returns true
 *
 * // When property exists but its value is undefined
 * const undefObj = { undefProp: undefined };
 * has_property(undefObj, 'undefProp'); // Returns true
 *
 * @template X - The type of the object.
 * @template Y - The type of the property key.
 * @param {X} obj - The object to check.
 * @param {Y} prop - The property to check for.
 * @returns {boolean} - True if the object has the property, false otherwise.
 */
export function has_property<X, Y extends PropertyKey>(
	obj: X,
	prop: Y
): obj is X &
	Record<
		Y extends keyof X ? Y : keyof X extends never ? Y : keyof X,
		Y extends keyof X ? X[Y] : unknown
	> {
	if (obj === null || obj === undefined) {
		return false;
	}
	return prop in Object(obj);
}

/**
 * Calls a function and returns its result. If an error is thrown during the function call, returns undefined.
 *
 * @example
 * const result1 = unthrow(() => 10); // Returns 10
 * const result2 = unthrow(() => { throw new Error('Something went wrong'); }); // Returns undefined
 *
 * @template X - The type of the result returned by the function.
 * @param {() => X} func - The function to call.
 * @returns {X | undefined} - The result of the function, or undefined if an error is thrown.
 */
export function unthrow<X>(func: () => X): X | undefined {
	try {
		return func();
	} catch (_) {
		return undefined;
	}
}

type NonEmptyDefined<A extends ReadonlyArray<unknown>> = A extends NonEmptyArray<infer T>
	? T
	: A extends ReadonlyArray<infer T>
	? T | undefined
	: never;

/**
 * Returns the element at the given index in an array, wrapping around to the start or end as necessary.
 * Returns undefined if the array is empty.
 *
 * @example
 * const arr = ['Apple', 'Banana', 'Cherry'];
 * at(arr, 2); // Returns 'Cherry'
 * at(arr, -1); // Returns 'Cherry'
 * at(arr, 3); // Returns 'Apple'
 * at(arr, 7); // Returns 'Banana'
 * at([], 0); // Returns undefined
 *
 * @template T - The type of the elements in the array.
 * @param {ReadonlyArray<T>} arr - The array to retrieve the element from.
 * @param {number} index - The index to use, which may be negative or greater than the array's length.
 * @returns {T | undefined} - The element at the given index, accounting for wrap-around, or undefined if the array is empty.
 */
export function at<A extends ReadonlyArray<unknown>>(arr: A, index: number): NonEmptyDefined<A> {
	if (arr.length === 0) {
		return undefined as NonEmptyDefined<A>;
	}
	return arr[((index % arr.length) + arr.length) % arr.length] as NonEmptyDefined<A>;
}

/**
 * @template T - The type of the elements in the array.
 * @param {T[]} arr - The array to retrieve the element from.
 * @param {(v: T) => boolean} predicate - The function to test each element of the array.
 * @param {number} start_index - The index to start the search from, which may be negative or greater than the array's length.
 * @param {boolean} cyclic - If the search should wrap around to the beginning of the array when reaching the end.
 * @returns {T | undefined} - The first element that satisfies the provided testing function. Otherwise, undefined.
 */
export function find_from<T>(
	arr: T[],
	predicate: (v: T) => boolean,
	start_index: number,
	cyclic: boolean
): T | undefined {
	if (!isNonEmptyArray(arr)) {
		return undefined;
	}

	let index = start_index;
	const end_index = cyclic ? start_index + arr.length : arr.length;

	while (index < end_index) {
		const value = at(arr, index);

		if (predicate(value)) {
			return value;
		}

		index++;
	}

	return undefined;
}

/**
 * Checks if a string is valid JSON.
 *
 * @example
 * const str1 = '{"a":1,"b":2}';
 * const str2 = 'This is not JSON';
 * is_json(str1); // Returns true
 * is_json(str2); // Returns false
 *
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string is valid JSON, false otherwise.
 */
export function is_json(str: string): boolean {
	return unthrow(() => JSON.parse(str)) !== undefined;
}

/**
 * Creates an object where the keys are the values of a given key in the input objects.
 *
 * @example
 * const arr = [{id: '1', name: 'Apple'}, {id: '2', name: 'Banana'}];
 * const key = 'id';
 * index_by(arr, key); // Returns { '1': {id: '1', name: 'Apple'}, '2': {id: '2', name: 'Banana'} }
 *
 * @template K - The type of the key.
 * @template T - The type of the objects in the array, which should be an object with a string property of type K.
 * @param {ReadonlyArray<T>} arr - The array of objects to use.
 * @param {K} key - The key to use.
 * @returns {Record<T[K], T>} - The resulting object.
 */
export function index_by<K extends string, T extends Record<K, string> & object>(
	arr: ReadonlyArray<T>,
	key: K
): Record<T[K], T> {
	return typed_from_entries(arr.map((v) => [v[key], v]));
}

/**
 * Throws an error with a given message.
 *
 * @example
 * undefined ?? panic('This is an error'); // Throws an error with the message 'This is an error'
 *
 * @param {string} [message='Unknown Internal Error, caused by "panic"'] - The message to use for the error.
 * @throws {Error} - Always throws an error.
 */
export function panic(message = 'Unknown Internal Error, caused by "panic"'): never {
	throw new Error(message);
}

/**
 * Passes a value to a function and returns the result of the function.
 *
 * @example
 * const value = 5;
 * const func = (v) => v * v;
 * pipe(value, func); // Returns 25
 *
 * @template A - The type of the value.
 * @template B - The type of the result of the function.
 * @param {A} value - The value to pass to the function.
 * @param {(v: A) => B} func - The function to pass the value to.
 * @returns {B} - The result of the function.
 */
export function pipe<A, B>(value: A, func: (v: A) => B): B {
	return func(value);
}

/**
 * Uses a value in a way that does nothing, to avoid unused variable warnings.
 *
 * @example
 * const value = 5;
 * fake_use(value); // Does nothing
 *
 * @template T - The type of the value.
 * @param {T} _value - The value to use.
 * @returns {void}
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function fake_use<T>(_value: T): void {
	// do nothing
}

/**
 * Does nothing. Useful as a default function.
 *
 * @example
 * noop(); // Does nothing
 *
 * @returns {void}
 */
export function noop(): void {
	// do nothing
}
