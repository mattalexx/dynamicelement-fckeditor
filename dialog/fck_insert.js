
function Import(aSrc) {
   document.write('<scr'+'ipt type="text/javascript" src="'+aSrc+'"></sc'+'ript>');
}

var getElementTypes = function() {
	var elementTypes = [];
	var xml = new oEditor.FCKXml();
	console.log(oEditor.FCKConfig.ElementTypesXmlPath);
	xml.LoadUrl(oEditor.FCKConfig.ElementTypesXmlPath);
	var elementTypeNodes = xml.SelectSingleNode('elementTypes').childNodes;
	for (i = 0; i < elementTypeNodes.length; i++) {
		var child = elementTypeNodes[i];
		if (child.nodeType == 1) {
			var obj = {
				key: child.getAttribute('key'),
				name: child.getAttribute('name'),
			};
			if (child.getAttribute('depends')) {
				obj.depends = child.getAttribute('depends');
				obj.dependsTitle = child.getAttribute('dependsTitle');
			}
			elementTypes.push(obj);
		}
	}
	return elementTypes;
}

var getSelectedDiv = function() {
	var CurrentContainers = oEditor.FCKDomTools.GetSelectedDivContainers();
	if (CurrentContainers.length < 1 || CurrentContainers[0].className.indexOf('dynamicelement') === -1) {
		return null;
	}
	if (!divType(CurrentContainers[0])) {
		return null;
	}
	return CurrentContainers[0];
};

var divType = function(div) {
	var validKeys = [];
	if (!div.className) {
		return null;
	}
	var classes = div.className.split(' ');
	for (var i = 0; i < elementTypes.length; i++) {
		validKeys.push(elementTypes[i].key);
	}
	for (var i = 0; i < classes.length; i++) {
		var divType = validKeys.indexOf(classes[i]);
		if (divType !== -1) {
			return classes[i];
		}
	}
	return null;
};

var addOptionToSelect = function(select, value, label, selected) {
	var opt = document.createElement('option');
	opt.text = label;
	opt.value = value;
	if (selected) opt.selected = true;
	if (oEditor.FCKBrowserInfo.IsIE) elementTypeSelect.add(opt);
	else elementTypeSelect.add(opt, null);
};

var oEditor = window.parent.InnerDialogLoaded();
var elementTypes = getElementTypes();
var div = getSelectedDiv();
if (div) var divType = divType(div);
var elementTypeSelect = null;

Import(oEditor.FCKConfig.FullBasePath+'dialog/common/fck_dialog_common.js');

window.onload = function() {
	oEditor.FCKLanguageManager.TranslatePage(document);
	elementTypeSelect = document.getElementById('cmbElementType');
	addOptionToSelect(elementTypeSelect, '', '');
	for (var i = 0; i < elementTypes.length; i++) {
		addOptionToSelect(elementTypeSelect, elementTypes[i].key, elementTypes[i].name, divType === elementTypes[i].key);
	}
	window.parent.SetOkButton(true);
	window.parent.SetAutoSize(true);
}

function CreateFakeImage(fakeClass, realElement) {
	var img = document.createElement('img');
	img.className = fakeClass;
	img.src = oEditor.FCKConfig.BasePath+'images/spacer.gif';
	img.setAttribute('_fckfakelement', 'true', 0);
	img.setAttribute('_fckrealelement', oEditor.FCKTempBin.AddElement(realElement), 0);
	return img;
}

function insertNewDiv() {
	var e = oEditor.FCK.EditorDocument.createElement('DIV');
	e.innerHTML = '<span style="DISPLAY:none">&nbsp;</span>';
	var oFakeImage = CreateFakeImage( 'FCK__DynamicElement', e);
	var oRange = new oEditor.FCKDomRange( oEditor.FCK.EditorWindow);
	oRange.MoveToSelection();
	var oSplitInfo = oRange.SplitBlock();
	oRange.InsertNode(oFakeImage);
	oEditor.FCK.Events.FireEvent('OnSelectionChange');
	return e;
}

function Ok() {
	oEditor.FCKUndo.SaveUndoStep();
	if (!div) {
		div = insertNewDiv();
	}
	div.setAttribute('class', 'dynamicelement '+elementTypeSelect.value);
	div.setAttribute('title', elementTypeSelect[elementTypeSelect.selectedIndex].innerHTML);
	div.innerHTML = '';
	for (var i = 0; i < elementTypes.length; i++) {
		if (elementTypes[i].key === elementTypeSelect.value && elementTypes[i].depends) {
			//alert('This dynamic element depends on another, called "'
			//	+elementTypes[i].dependsTitle+'".'+"\n\n"+'For things to work, '
			//	+'the "'+elementTypes[i].dependsTitle+'" element must exist in '
			//	+'the other editor.');
		}
	}
	return true;
}
