import isPlainObject from "./is-plain-object";

export default function flatObject( obj, separator = ".", stack = [], parentName = "" )
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
