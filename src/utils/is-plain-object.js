export default function isPlainObject( target )
{
	return [ undefined, Object ].includes( target?.constructor );
}
