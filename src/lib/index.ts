import { maxBy } from 'lodash-es';

export function abs(value: number): number {
	return Math.abs(value);
}
export function all(values: unknown[]): boolean {
	if (values.length === 0) {
		return true;
	} else {
		return values.reduce<boolean>((a, b) => !!a && !!b, !!values[0]);
	}
}
export function any(values: unknown[]): boolean {
	for (const value of values) {
		if (value) {
			return true;
		}
	}
	return false;
}

export function divmod(value: number, divider: number): [number, number] {
	return [Math.floor(value / divider), value % divider];
}
export function enumerate<T>(values: T[]): [number, T][] {
	return values.map((v, i) => [i, v]);
}

export function range(arg1: number, arg2: number | undefined = undefined): Array<number> {
	if (!arg2) {
		arg2 = arg1;
		arg1 = 0;
	} else if (arg1 > arg2) {
		throw 'Arg2 has to be higher or equal compared to Arg1';
	}
	return [...Array(arg2 - arg1).keys()].map((v) => v + arg1);
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

export function typed_entries<K extends PropertyKey, V>(obj: Record<K, V>): Array<[K, V]> {
	return Object.entries(obj) as Array<[K, V]>;
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