/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	zip,
	range,
	pairs,
	object_assign_if_truthy,
	fold,
	apply,
	cover,
	pass_back,
	map_values,
	map_number_entries,
	map_number_keys,
	final_join,
	index_by,
	has_property,
	cyclic_pairs,
	unthrow,
	noop,
	fake_use,
	init_array,
	maybe_global
} from '$lib/index';
import { assert, it } from 'vitest';

it('Pairs', () => {
	assert.deepEqual(pairs([5, 6, 8, 2, 7, 9, 0]), [
		[5, 6],
		[6, 8],
		[8, 2],
		[2, 7],
		[7, 9],
		[9, 0]
	]);
}, 1000);

it('Unthrow', () => {
	const f = (x: number) => {
		if (x < 0) {
			throw new Error('Negative');
		}
		return x;
	};
	assert.equal(
		unthrow(() => f(5)),
		5
	);
	assert.equal(
		unthrow(() => f(-5)),
		undefined
	);
});

it('Init Array', () => {
	assert.deepEqual(init_array(3, [2, 3]), [
		[3, 3, 3],
		[3, 3, 3]
	]);
	assert.deepEqual(init_array(3, []), 3);
	assert.deepEqual(init_array('l', [2, 3, 4]), [
		[
			['l', 'l', 'l', 'l'],
			['l', 'l', 'l', 'l'],
			['l', 'l', 'l', 'l']
		],
		[
			['l', 'l', 'l', 'l'],
			['l', 'l', 'l', 'l'],
			['l', 'l', 'l', 'l']
		]
	]);
});

it('Cyclic Pairs', () => {
	assert.deepEqual(cyclic_pairs([5, 6, 8, 2, 7, 9, 0]), [
		[5, 6],
		[6, 8],
		[8, 2],
		[2, 7],
		[7, 9],
		[9, 0],
		[0, 5]
	]);
}, 1000);

it('Zip', () => {
	assert.deepEqual(
		zip([
			[5, 6, 8, 2],
			[7, 9, 0]
		]),
		[
			[5, 7],
			[6, 9],
			[8, 0]
		]
	);
	assert.deepEqual(
		zip([
			[5, 6, 8],
			[7, 9, 0, 9]
		]),
		[
			[5, 7],
			[6, 9],
			[8, 0]
		]
	);
	assert.deepEqual(zip([[1, 2, 3]]), [[1], [2], [3]]);
	assert.deepEqual(zip([]), []);

	assert.deepEqual(
		zip([
			[5, 6, 8, 2],
			['a', 'b', 'c']
		] as [number[], string[]]),
		[
			[5, 'a'],
			[6, 'b'],
			[8, 'c']
		]
	);
	assert.deepEqual(
		zip([
			[5, 6, 8],
			['a', 'b', 'c', 'd']
		]),
		[
			[5, 'a'],
			[6, 'b'],
			[8, 'c']
		]
	);
	assert.deepEqual(zip([[], []]), []);

	// Test case with empty arrays
	assert.deepEqual(zip([]), []);

	// Test case with arrays of different lengths
	assert.deepEqual(
		zip([
			[1, 2, 3],
			[4, 5],
			[6, 7, 8, 9]
		]),
		[
			[1, 4, 6],
			[2, 5, 7]
		]
	);

	// Test case with arrays of different types
	assert.deepEqual(
		zip([
			[1, 2, 3],
			['a', 'b', 'c']
		]),
		[
			[1, 'a'],
			[2, 'b'],
			[3, 'c']
		]
	);

	// Test case with empty inner arrays
	assert.deepEqual(zip([[1, 2, 3], [], [4, 5, 6]]), []);

	// Test case with a single inner array
	assert.deepEqual(zip([[1, 2, 3]]), [[1], [2], [3]]);

	// Test case with multiple empty arrays
	assert.deepEqual(zip([[], [], []]), []);

	// Test case with null values in arrays
	assert.deepEqual(
		zip([
			[null, 2, 3],
			[4, null, 6]
		]),
		[
			[null, 4],
			[2, null],
			[3, 6]
		]
	);
}, 1000);

it('MaybeGlobal', () => {
	// Define a global variable
	(global as any).test = 5;

	// Test that the global variable is returned
	assert.equal(maybe_global('test'), 5);

	const window2: typeof Math | undefined = maybe_global('Math');
	assert.equal(window2, Math);
});

it('Has Property', () => {
	// Existing properties on an object
	assert.equal(has_property({ 2: 'test', 5: 'ok' }, 'test' as any), false);
	assert.equal(has_property({ 2: 'test', 5: 'ok' }, 2), true);
	assert.equal(has_property({}, 2), false);
	assert.equal(has_property({ 2: 'test', ok: 'ok' }, 'ok'), true);

	// Properties on the prototype chain
	assert.equal(has_property(5, 'toString'), true);
	assert.equal(has_property([], 'toString'), true);
	assert.equal(has_property({}, 'toString'), true);

	// Properties on array objects
	assert.equal(has_property([5, 10, 15], '0'), true);
	assert.equal(has_property([5, 10, 15], 2), true);
	assert.equal(has_property([5, 10, 15], 'length'), true);

	// Undefined and null cases
	assert.equal(has_property(undefined, 'property'), false);
	assert.equal(has_property(null, 'property'), false);

	// Properties on function objects
	assert.equal(has_property(noop, 'call'), true);

	// Properties on string objects
	assert.equal(has_property('test', 'length'), true);

	// Symbol properties
	const sym = Symbol();
	assert.equal(has_property({ [sym]: 'value' }, sym), true);

	// Non-existing properties
	assert.equal(has_property({ a: 1 }, 'b'), false);
	assert.equal(has_property([1, 2, 3], 5), false);

	{
		// Type tests
		const obj1 = {};
		if (has_property(obj1, 'prop')) {
			// @ts-expect-error - Error: 'length' does not exist on type 'unknown'
			fake_use(obj1.prop.length);
		}

		const obj2: unknown = { prop: 'hello' };
		if (has_property(obj2, 'prop')) {
			fake_use(obj2.prop); // No error: the type of 'obj2' is narrowed to { prop: unknown }
		}

		const obj3 = { prop: 'hello' };
		if (has_property(obj3, 'prop')) {
			fake_use(obj3.prop.length); // No error: the type of 'obj3' is narrowed to { prop: unknown }, and 'length' does exist on type 'string'
		}

		const obj4 = { notProp: 'hello' };
		if (has_property(obj4, 'prop')) {
			// @ts-expect-error - Error: Property 'prop' does not exist on type '{ notProp: string; }'.
			fake_use(obj4.prop.length);
		}

		const obj5 = 5;
		if (has_property(obj5, 'toFixed')) {
			fake_use(obj5.toFixed(2)); // No error: the type of 'obj5' is narrowed to Record<'toFixed', unknown>, and 'toFixed' does exist on type 'number'
		}

		const obj6 = Object.create({ prop: 'hello' });
		if (has_property(obj6, 'prop')) {
			fake_use(obj6.prop.length); // No error: the type of 'obj6' is narrowed to { prop: unknown }, and 'length' does exist on type 'string'
		}

		const obj7 = [1, 2, 3] as unknown;
		if (has_property(obj7, '0')) {
			fake_use(obj7[0]); // No error: the type of 'obj7' is narrowed to Record<'0', unknown>
		} else {
			// @ts-expect-error - Error: Property '0' does not exist on type 'unknown[]'.
			fake_use(obj7[0]);
		}
	}
});

it('Range', () => {
	assert.deepEqual(range(6), [0, 1, 2, 3, 4, 5]);
	assert.deepEqual(range(3, 11), [3, 4, 5, 6, 7, 8, 9, 10]);
	assert.deepEqual(range(5, 5), []);
	assert.deepEqual(range(4, 5), [4]);
	assert.deepEqual(range(0), []);
	assert.deepEqual(range(-1), [0]);
	assert.deepEqual(range(1), [0]);
	assert.deepEqual(range(-4), [0, -1, -2, -3]);
	assert.deepEqual(range(-4, 4), [-4, -3, -2, -1, 0, 1, 2, 3]);
	assert.deepEqual(range(-4, -7), [-4, -5, -6]);
	assert.deepEqual(range(-7, -4), [-7, -6, -5]);
	assert.deepEqual(range(3, -3), [3, 2, 1, 0, -1, -2]);
}, 1000);

it('SetEmpty', () => {
	const obj = { x: '2' };
	object_assign_if_truthy(obj, 'x', '');
	assert.isFalse('x' in obj);
	object_assign_if_truthy(obj, 'x', '5');
	assert.isTrue('x' in obj);
}, 1000);

it('Fold', () => {
	assert.equal(
		fold('2', [1, 2, 3], (v1, v2) => v1 + v2),
		'2123'
	);
}, 1000);

it('MultiApply', () => {
	assert.equal(
		apply(7, [
			[1, (v1, v2) => v1 + v2],
			[2, (v1, v2) => v1 - v2],
			[3, (v1, v2) => v1 * v2]
		]),
		18
	);
}, 1000);

it('Cover', () => {
	assert.deepEqual(cover({ x: 3, n: 4, p: 'Test' }, { n: 7 }), { x: 3, n: 7, p: 'Test' });
	assert.deepEqual(cover({ x: 3, n: 4, p: 'Test' }, { x: 7, p: 'ok' }), { x: 7, n: 4, p: 'ok' });
});

it('Pass_back', () => {
	let x = 2;
	const f = (v: number) => {
		x += v;
	};
	assert.equal(pass_back(4, f), 4);
	assert.equal(x, 6);
});

it('Map_values', () => {
	assert.deepEqual(
		map_values({ x: 2, 4: 6, 0: 7 } as const, (n) => n - 4),
		{ x: -2, 0: 3, 4: 2 }
	);
	assert.deepEqual(
		map_values({}, (n) => n * 2),
		{}
	);
});

it('Map_keys', () => {
	assert.deepEqual(
		map_number_keys({ 7: 2, 4: 6, 0: 7 } as const, (n) => n * 2),
		{ 14: 2, 8: 6, 0: 7 }
	);
	assert.deepEqual(
		map_number_keys({}, (n) => n * 2),
		{}
	);
});

it('Map_entries', () => {
	assert.deepEqual(
		map_number_entries({ 7: 2, 4: 6, 0: 8 } as const, ([k, v]) => [v - 2, k + 2]),
		{ 0: 9, 4: 6, 6: 2 }
	);
	assert.deepEqual(
		map_number_entries({}, () => [5, undefined] as never),
		{}
	);
});

it('Final Join', () => {
	assert.equal(final_join(['1', '2', '3', '4'], ', ', ' and '), '1, 2, 3 and 4');
	assert.equal(final_join([], ', ', ' and '), '');
	assert.equal(final_join(['1', '2'], ', ', ' and '), '1 and 2');
	assert.equal(final_join(['1'], ', ', ' and '), '1');
});

it('Index by', () => {
	const objs = [
		{
			id: '1',
			name: 'A'
		},
		{
			id: '2',
			name: 'B'
		},
		{
			id: '3',
			name: 'C'
		}
	] as const;
	assert.deepEqual(index_by(objs, 'id'), {
		'1': objs[0],
		'2': objs[1],
		'3': objs[2]
	});

	interface Asset<T extends string> {
		id: T;
		name: string;
		note: string;
		image: string;
	}

	const objs2: ReadonlyArray<Asset<'1' | '2' | '3'>> = [
		{
			id: '1',
			name: 'A',
			note: '1',
			image: '1'
		},
		{
			id: '2',
			name: 'B',
			note: '2',
			image: '2'
		},
		{
			id: '3',
			name: 'C',
			note: '3',
			image: '3'
		}
	] as const;
	assert.deepEqual(index_by(objs2, 'id'), {
		'1': objs2[0],
		'2': objs2[1],
		'3': objs2[2]
	});
});
