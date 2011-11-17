/*
 * FCKeditor - The text editor for Internet - http://www.fckeditor.net
 * Copyright (C) 2003-2008 Frederico Caldeira Knabben
 *
 * == BEGIN LICENSE ==
 *
 * Licensed under the terms of any of the following licenses at your
 * choice:
 *
 * - GNU General Public License Version 2 or later (the "GPL")
 * http://www.gnu.org/licenses/gpl.html
 *
 * - GNU Lesser General Public License Version 2.1 or later (the "LGPL")
 * http://www.gnu.org/licenses/lgpl.html
 *
 * - Mozilla Public License Version 1.1 or later (the "MPL")
 * http://www.mozilla.org/MPL/MPL-1.1.html
 *
 * == END LICENSE ==
 *
 * fck_insert.js
 */

var ImportScript = function( sSrc )
{
	document.write( '<scr' + 'ipt type="text/javascript" src="' + sSrc + '"></sc' + 'ript>' ) ;
} ;

var LoadJson = function( sSrc )
{
	var request = new XMLHttpRequest();
	request.open( 'GET', sSrc, false );
	request.send( null );
	if ( request.status == 200 )
	{
		return eval( '(' + request.responseText + ')' );
	}
} ;

var AddOptionToSelect = function(oSelect, sValue, sLabel, isSelected)
{
	var oOption = document.createElement('option');
	oOption.text = sLabel;
	oOption.value = sValue;
	if (isSelected)
		oOption.selected = true;

	if (oEditor.FCKBrowserInfo.IsIE)
		oSelect.add(oOption);
	else
		oSelect.add(oOption, null);
};

var aElementTypes ;
var GetElementTypes = function()
{
	if ( typeof aElementTypes !== 'undefined' )
		return aElementTypes ;

	aElementTypes = [] ;
	var oXml = new oEditor.FCKXml() ;
	oXml.LoadUrl( oEditor.FCKConfig.ElementTypesXmlPath ) ;
	var aNodes = oXml.SelectNodes('/xml/elementTypes/elementType');

	for ( i = 0 ; i < aNodes.length ; i++ )
	{
		var oNode = aNodes[i] ;
		if ( oNode.nodeType !== 1 )
		{
			continue;
		}

		var obj =
		{
			key: oNode.getAttribute( 'key' ),
			name: oNode.getAttribute( 'name' )
		} ;

		var aFields = oNode.querySelector( 'fields' );
		if ( aFields && aFields.childNodes )
		{
			obj.fields = [] ;

			for ( ii = 0 ; ii < aFields.childNodes.length ; ii++ )
			{
				var oField = aFields.childNodes[ii] ;
				
				var field =
				{
					key: oField.getAttribute( 'key' ),
					name: oField.getAttribute( 'name' ),
					type: oField.getAttribute( 'type' )
				} ;

				switch (oField.getAttribute('type')) {
					case 'select':
						var items = oField.querySelector( 'items' ) ;
						if (items)
						{
							var items_ = {};
							for ( iii = 0 ; iii < items.childNodes.length ; iii++ )
							{
								var value = items.childNodes[iii].getAttribute('value') ;
								var label = items.childNodes[iii].getAttribute('label') ;
								items_[value] = label;
							}

							field.items = items_;
							break;
						}

						var jsonSource = oField.getAttribute( 'jsonSource' ) ;
						if (jsonSource)
						{
							var data = LoadJson( jsonSource ) ;
							field.items = data.items ;
							break;
						}
							
						break;
				}

				obj.fields.push( field );
			}
		}

		if ( oNode.getAttribute( 'depends' ) )
		{
			obj.depends = oNode.getAttribute( 'depends' ) ;
			obj.dependsTitle = oNode.getAttribute( 'dependsTitle' ) ;
		}

		aElementTypes.push( obj ) ;
	}

	return aElementTypes ;
} ;

var GetElementType = function( key )
{
	var aElementTypes = GetElementTypes() ;
	for ( var i = 0 ; i < aElementTypes.length ; i++ )
	{
		if ( aElementTypes[i].key === key )
			return aElementTypes[i];
	}

	return false ;
} ;

var aValidTypes ;
var GetValidTypes = function()
{
	if (typeof aValidTypes !== 'undefined')
		return aValidTypes ;

	var aElementTypes = GetElementTypes() ;
	aValidTypes = [] ;
	for ( var i = 0 ; i < aElementTypes.length ; i++ )
		aValidTypes.push( aElementTypes[i].key ) ;

	return aValidTypes ;
} ;

var oSelectedImage ;
var GetSelectedImage = function()
{
	if (typeof oSelectedImage !== 'undefined')
		return oSelectedImage ;

	var oSelected = oEditor.FCKSelection.GetSelectedElement() ;
	var aValidTypes = GetValidTypes() ;
	if ( ! oSelected || oSelected.tagName !== 'IMG' ||
		! oSelected.getAttribute( '_fck_dynamicelement' ) )
	{
		oSelectedImage = false ;
		return false ;
	}

	oSelectedImage = oSelected ;

	return oSelectedImage ;
} ;

var oSelectedDiv ;
var GetSelectedDiv = function()
{
	if (typeof oSelectedDiv !== 'undefined')
		return oSelectedDiv ;

	var oSelectedImage = GetSelectedImage() ;
	if ( ! oSelectedImage )
	{
		oSelectedDiv = false ;
		return false ;
	}

	oSelectedDiv = oEditor.FCK.GetRealElement( oSelectedImage ) ;

	var sSelectedDivType = oSelectedDiv.getAttribute( 'data-type' );
	if ( !oSelectedDiv || aValidTypes.indexOf( sSelectedDivType ) === -1 )
	{
		oSelectedDiv = false ;
		return false ;
	}

	return oSelectedDiv ;
} ;

var InitializeSelect = function( )
{
	oSelect = document.getElementById( 'cmbElementType' ) ;
	var aElementTypes = GetElementTypes() ;
	var oSelectedDiv = GetSelectedDiv() ;

	var sSelectedDivType = false;
	if (oSelectedDiv)
		sSelectedDivType = oSelectedDiv.getAttribute( 'data-type' );

	AddOptionToSelect( oSelect, '', '' ) ;
	for ( var i = 0 ; i < aElementTypes.length ; i++ )
	{
		var isSelected = ( sSelectedDivType === aElementTypes[i].key ) ;
		AddOptionToSelect( oSelect, aElementTypes[i].key, aElementTypes[i].name,
			isSelected ) ;
	}

	var refresh = function() {
		var oFieldsDiv = GetFieldsDiv();

		while (oFieldsDiv.childNodes[0])
		{
			var child = oFieldsDiv.childNodes[0];
			oFieldsDiv.removeChild(child);
		}

		if ( oSelect.selectedIndex === 0 )
			return false ;

		var oElementType = GetElementType( oSelect.options[oSelect.selectedIndex].value ) ;

		if ( ! oElementType.fields )
			return false ;

		for ( var i = 0 ; i < oElementType.fields.length ; i++ )
		{
			var field = oElementType.fields[i] ;

			var oFieldDiv = document.createElement('div') ;
			oFieldDiv.className = 'field' ;
			oFieldDiv.id = 'field-' + field.key ;

			var oFieldLabel = document.createElement('div') ;
			oFieldLabel.textContent = field.name;
			oFieldDiv.appendChild( oFieldLabel );

			switch (field.type) {
				case 'select':

					var sValue;
					if (oSelectedDiv)
						sValue = oSelectedDiv.getAttribute( 'data-param-' + field.key );

					var oFieldSelect = document.createElement('select');
					AddOptionToSelect( oFieldSelect, '', '' ) ;
					for (var value in field.items)
					{
						var isSelected = ( sValue === value ) ;
						AddOptionToSelect( oFieldSelect, value,
							field.items[value], isSelected);
					}
					oFieldDiv.appendChild( oFieldSelect );
					break;
			}

			oFieldsDiv.appendChild( oFieldDiv );
		}

		window.parent.SetAutoSize( true ) ;
	} ;

	oSelect.onchange = refresh ;
	refresh();
} ;

var GetFieldsDiv = function ()
{
	var oSelect = document.getElementById( 'cmbElementType' ) ;
	var oFieldsDiv = oSelect.nextSibling.nextSibling;
	return oFieldsDiv;
} ;

var CreateNewDiv = function ()
{
	var oDiv = oEditor.FCK.EditorDocument.createElement( 'DIV' ) ;
	var oRange = new oEditor.FCKDomRange( oEditor.FCK.EditorWindow ) ;
	oRange.MoveToSelection() ;
	oRange.SplitBlock() ;
	oRange.InsertNode( oDiv ) ;
	oEditor.FCK.Events.FireEvent( 'OnSelectionChange' ) ;
	return oDiv ;
} ;

var Ok = function ()
{
	if ( oSelect.selectedIndex === 0 )
		return false ;

	oEditor.FCKUndo.SaveUndoStep() ;

	oDiv = CreateNewDiv() ;

	var oElementType = GetElementType( oSelect.options[oSelect.selectedIndex].value ) ;

	oDiv.setAttribute( 'class', 'dynamicelement' ) ;
	oDiv.setAttribute( 'data-type', oElementType.key ) ;
	oDiv.setAttribute( 'title', oElementType.name ) ;
	oDiv.innerHTML = '' ;

	if ( oElementType.fields )
	{
		for ( var i = 0 ; i < oElementType.fields.length ; i++ )
		{
			var field = oElementType.fields[i] ;
			var oFieldDiv = document.getElementById('field-' + field.key ) ;

			switch (field.type) {
				case 'select':
					var select = oFieldDiv.getElementsByTagName('select')[0];
					var value = select.options[select.selectedIndex].value ;
					oDiv.setAttribute( 'data-param-' + field.key, value ) ;
					break;
			}
		}
	}

	ProcessDiv(oDiv);

	return true ;
} ;

var oEditor = oApi = window.parent.InnerDialogLoaded() ;
var oSelect ;

ImportScript( oEditor.FCKConfig.FullBasePath+'dialog/common/fck_dialog_common.js' ) ;
ImportScript( oEditor.FCKPlugins.Items.dynamicelement.Path+'common.js' ) ;

window.onload = function()
{
	InitializeSelect() ;

	window.parent.SetOkButton( true ) ;
	window.parent.SetAutoSize( true ) ;
} ;
