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
	ensure_delete_from_set,
	index_by,
	tuple_zip,
	has_property
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
}, 1000);

it('TupleZip', () => {
	assert.deepEqual(
		tuple_zip([
			[5, 6, 8, 2],
			['a', 'b', 'c']
		]),
		[
			[5, 'a'],
			[6, 'b'],
			[8, 'c']
		]
	);
	assert.deepEqual(
		tuple_zip([
			[5, 6, 8],
			['a', 'b', 'c', 'd']
		]),
		[
			[5, 'a'],
			[6, 'b'],
			[8, 'c']
		]
	);
	assert.deepEqual(tuple_zip([[], []]), []);
}, 1000);

it('Has Property', () => {
	assert.equal(has_property({ 2: 'test', 5: 'ok' }, 'test' as any), false);
	assert.equal(has_property({ 2: 'test', 5: 'ok' }, 2), true);
	assert.equal(has_property({} as unknown, 2), false);
	assert.equal(has_property({ 2: 'test', ok: 'ok' }, 'ok'), true);
	assert.equal(has_property(5, 'toString'), true);
	assert.equal(has_property([], 'toString'), true);
	assert.equal(has_property({} as unknown, 'toString'), true);
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
		map_number_entries({}, () => undefined),
		{}
	);
});

it('Final Join', () => {
	assert.equal(final_join(['1', '2', '3', '4'], ', ', ' and '), '1, 2, 3 and 4');
	assert.equal(final_join([], ', ', ' and '), '');
	assert.equal(final_join(['1', '2'], ', ', ' and '), '1 and 2');
	assert.equal(final_join(['1'], ', ', ' and '), '1');
});

it('Set Delete', () => {
	const obj = new Set([1, 2, 3]);
	assert.equal(ensure_delete_from_set(obj, 2), true);
	assert.isFalse(obj.has(2));
	assert.isTrue(obj.has(1));
	assert.equal(ensure_delete_from_set(obj, 2), false);
	assert.equal(ensure_delete_from_set(obj, 1), true);
	assert.equal(ensure_delete_from_set(obj, 1), false);
	const obj2 = new Set([{ x: 1 }, { x: 2 }, { x: 3 }]);
	assert.equal(ensure_delete_from_set(obj2, { x: 2 }), true);
	assert.isFalse(obj2.has({ x: 2 }));
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
