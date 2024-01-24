export default function camelToDash( str )
{
	return str
		.replace( /[A-Z]/g, letter =>
			"-" + letter.toLowerCase()
		)
		.split( "" )
		.filter(( letter, i ) =>
			! ( i === 0 && letter == "-" )
		)
		.join( "" );
}
