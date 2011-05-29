
var ProcessDiv = function ( oDiv )
{
	var sImageUrl = oApi.FCKPlugins.Items.dynamicelement.Path +
		'image.php?text=' + escape( oDiv.getAttribute( 'title' ) ) ;
	var aStyles = [ 'clear: both', 'display: block', 'margin-bottom: 15px',
		'float: none', 'width: 100%', 'border: #2276c0 1px dotted',
		'height: 25px', 'background: url(' + sImageUrl + ') no-repeat 5px 7px' ] ;

	var oImg = oApi.FCKDocumentProcessor_CreateFakeImage( 'FCK__DynamicElement',
		oDiv.cloneNode( true ) ) ;
	oImg.setAttribute( '_fck_dynamicelement', '1' ) ;
	oImg.setAttribute( 'style', aStyles.join('; ') ) ;

	oDiv.parentNode.insertBefore( oImg, oDiv ) ;
	oDiv.parentNode.removeChild( oDiv ) ;
}
