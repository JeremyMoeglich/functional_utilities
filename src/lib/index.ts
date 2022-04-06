import { isEqual, maxBy, toInteger } from 'lodash-es';

export function range(arg1: number, arg2: number | undefined = undefined): Array<number> {
	const end = arg2 ? arg2 : arg1;
	const start = arg2 ? arg1 : 0;
	return Array.from(Array(Math.abs(end - start)).keys()).map(
		(v) => -v * (toInteger(start > end) - 0.5) * 2 + start
	);
}

export function zip<T>(lsts: T[][]) {
	if (lsts.length === 0) {
		return [];
	}
	const max_value = maxBy(lsts, (v) => v.length);
	if (typeof max_value === 'undefined') {
		throw 'max value was undefined, this should not happen';
	}
	return range(max_value.length).map((i) => lsts.map((lst) => lst[i]));
}

export function pairs<T>(lst: T[]): [T, T][] {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return zip([lst.slice(0, -1), lst.slice(1)]) as any;
}

export function set_empty<T>(obj: Record<PropertyKey, T>, key: symbol | number | string, value: T) {
	if (value) {
		obj[key] = value;
	} else {
		delete obj[key];
	}
}
export function apply<A, B>(value: A, values: Array<B>, func: (value: A, value2: B) => A): A {
	values.forEach((value2) => {
		value = func(value, value2);
	});
	return value;
}

export function multi_apply<A, B>(value: A, values: Array<[B, (value: A, value2: B) => A]>): A {
	values.forEach(([value2, func]) => {
		value = func(value, value2);
	});
	return value;
}

export function typed_keys<K extends PropertyKey>(obj: Record<K, unknown>): Array<K> {
	return Object.keys(obj) as Array<K>;
}

export function typed_number_keys<K extends number>(obj: Record<K, unknown>): K[] {
	return Object.keys(obj).map((v) => Number.parseFloat(v)) as K[];
}

export function typed_string_entries<K extends string, V>(obj: Record<K, V>): Array<[K, V]> {
	return Object.entries(obj) as Array<[K, V]>;
}

export function typed_entries<K extends PropertyKey, V>(obj: Record<K, V>): Array<[K, V]> {
	return Object.entries(obj) as Array<[K, V]>;
}

export function typed_number_entries<K extends number, V>(obj: Record<K, V>): Array<[K, V]> {
	return Object.entries(obj).map(([k, v]) => [Number.parseFloat(k), v]) as Array<[K, V]>;
}

export function typed_from_entries<K extends PropertyKey, V>(values: [K, V][]): Record<K, V> {
	return Object.fromEntries(values) as Record<K, V>;
}

export function nullableobj_to_partial<K extends PropertyKey, V>(
	obj: Record<K, V | null | undefined>
): Record<K, V> {
	return typed_from_entries(
		typed_entries(obj).filter(([, v]) => ((v ?? null) === null ? false : true))
	) as Record<K, V>;
}

export function map_keys<K extends PropertyKey, V, NK extends PropertyKey>(
	obj: Record<K, V>,
	func: (v: K) => NK
): Record<NK, V> {
	return typed_from_entries(typed_entries(obj).map(([k, v]) => [func(k), v]));
}

export function map_number_keys<K extends number, V, NK extends PropertyKey>(
	obj: Record<K, V>,
	func: (v: K) => NK
): Record<NK, V> {
	return typed_from_entries(typed_number_entries(obj).map(([k, v]) => [func(k), v]));
}

export function map_values<K extends PropertyKey, V, NV>(
	obj: Record<K, V>,
	func: (v: V) => NV
): Record<K, NV> {
	return typed_from_entries(typed_entries(obj).map(([k, v]) => [k, func(v)]));
}

export function map_entries<K extends PropertyKey, V, NK extends PropertyKey, NV>(
	obj: Record<K, V>,
	func: (entries: [K, V]) => [NK, NV]
): Record<NK, NV> {
	return typed_from_entries(typed_entries(obj).map((entry) => func(entry)));
}

export function map_number_entries<K extends number, V, NK extends PropertyKey, NV>(
	obj: Record<K, V>,
	func: (entries: [K, V]) => [NK, NV]
): Record<NK, NV> {
	return typed_from_entries(typed_number_entries(obj).map((entry) => func(entry)));
}

export function cover<T extends Record<PropertyKey, unknown>>(template: T, obj: Partial<T>): T {
	return map_entries(template, ([k, v]) => {
		if (k in obj) {
			return [k, obj[k]];
		} else {
			return [k, v];
		}
	}) as T;
}

export function pass_back<A>(value: A, func: (v: A) => unknown): A {
	func(value);
	return value;
}

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

export function hasProperty<X, Y extends PropertyKey>(
	obj: X,
	prop: Y
): obj is X & Record<Y, unknown> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (typeof obj?.[prop as any] === 'undefined') {
		return false;
	} else {
		return true;
	}
}

export function Set_delete<T>(set: Set<T>, value: T): boolean {
	if (set.has(value)) {
		set.delete(value);
		return true;
	} else {
		let found = false;
		for (const v of set) {
			if (isEqual(v, value)) {
				set.delete(v);
				found = true;
				break;
			}
		}
		return found;
	}
}
