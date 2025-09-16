export default function camelToDash( str: string ): string
{
	return str
		.replace( /[A-Z]/g, letter => "-" + letter.toLowerCase())
		.split( "" )
		.filter(( letter, i ) => ! ( i === 0 && letter == "-" ))
		.join( "" );
}
