import { isPlainObject } from ".";

/**
 * Flattens a nested object.
 *
 * @param obj - The object to be flattened.
 * @param separator - The separator to use for the keys.
 * @param stack - The stack to store the flattened items.
 * @param parentName - The parent name to prepend to the keys.
 * @returns The flattened object as an array of stack items.
 */
export default function flatObject(
	obj: {},
	separator: string = ".",
	stack: StackItem[] = [],
	parentName: string = ""
): StackItem[]
{
	parentName = parentName && parentName + separator;

	for( const key in obj )
	{
		if( isPlainObject( obj[ key ]))
		{
			flatObject( obj[ key ], separator, stack, parentName + key );
		}
		else
		{
			stack.push({
				key: parentName + key,
				value: obj[ key ]
			});
		}
	}

	return stack;
}

type StackItem = { key: string, value: string | number };
