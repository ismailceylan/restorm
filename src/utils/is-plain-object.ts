/**
 * Checks if the given value is a plain object.
 *
 * @param target - The value to be checked.
 * @return true if the value is a plain object, false otherwise.
 */
export default function isPlainObject( target: unknown ): target is Record<string, unknown>
{
	return [ undefined, Object ].includes(( target as any )?.constructor );
}
