
FCKCommands.RegisterCommand('InsertDynamicElement', new FCKDialogCommand('InsertDynamicElement', 
	FCKLang.DlgDynTitleInsertUpdate, FCKPlugins.Items.dynamicelement.Path+'dialog/fck_insert.html', 
	380, 210));

var oItem = new FCKToolbarButton('InsertDynamicElement', FCKLang.DlgDynTitleInsertUpdate);
oItem.IconPath = FCKPlugins.Items.dynamicelement.Path+'dynamicelement.png';
FCKToolbarItems.RegisterItem('InsertDynamicElement', oItem);

FCK.ContextMenu.RegisterListener({
	AddItems: function(menu, tag, tagName) {
		if ( tagName == 'IMG' && tag.className === 'FCK__DynamicElement') {
			menu.AddSeparator();
			menu.AddItem('InsertDynamicElement', FCKLang.DlgDynTitleUpdate, 
				FCKPlugins.Items.dynamicelement.Path+'dynamicelement.png');
		}
	}}
);

var FCKDynamicElementsProcessor = FCKDocumentProcessor.AppendNew();
FCKDynamicElementsProcessor.ProcessDocument = function(document) {
	var aDIVs = document.getElementsByTagName('DIV');
	var eDIV ;
	var i = aDIVs.length - 1;
	while (i >= 0 && (eDIV = aDIVs[i--])) {
		if (eDIV.className.indexOf('dynamicelement') !== -1) {
			var oFakeImage = FCKDocumentProcessor_CreateFakeImage('FCK__DynamicElement',
				eDIV.cloneNode(true));
			oFakeImage.setAttribute('title', eDIV.getAttribute('title'));
			eDIV.parentNode.insertBefore(oFakeImage, eDIV);
			eDIV.parentNode.removeChild(eDIV);
		}
	}
}
