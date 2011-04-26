
var ImportScript = function( sSrc )
{
	document.write( '<scr' + 'ipt type="text/javascript" src="' + sSrc + '"></sc' + 'ript>' ) ;
} ;
var oApi = window;
ImportScript( FCKPlugins.Items.dynamicelement.Path + 'common.js' ) ;

var sHtmlFile = FCKPlugins.Items.dynamicelement.Path + 'dialog/fck_insert.html' ;
var oDialogCommand = new FCKDialogCommand( 'InsertDynamicElement',
	FCKLang.DlgDynTitleInsertUpdate, sHtmlFile, 380, 190 ) ;
FCKCommands.RegisterCommand( 'InsertDynamicElement', oDialogCommand ) ;

var oItem = new FCKToolbarButton( 'InsertDynamicElement', FCKLang.DlgDynTitleInsertUpdate ) ;
var sIconUrl = FCKPlugins.Items.dynamicelement.Path + 'dynamicelement.png' ;
oItem.IconPath = sIconUrl ;
FCKToolbarItems.RegisterItem( 'InsertDynamicElement', oItem ) ;

var AddItems = function ( oMenu, oTag, sTagName )
{
	if ( sTagName !== 'IMG' || oTag.className !== 'FCK__DynamicElement' )
		return;
	oMenu.AddSeparator() ;
	oMenu.AddItem( 'InsertDynamicElement', FCKLang.DlgDynTitleUpdate, sIconUrl ) ;
} ;
FCK.ContextMenu.RegisterListener( { AddItems: AddItems } ) ;

FCKDocumentProcessor.AppendNew().ProcessDocument = function( document )
{
	var aDivs = document.getElementsByTagName( 'DIV' ) ;
	var i = aDivs.length - 1 ;
	while ( i >= 0 && ( oDiv = aDivs[i--] ) )
		ProcessDiv(oDiv, FCKDocumentProcessor_CreateFakeImage);
} ;
