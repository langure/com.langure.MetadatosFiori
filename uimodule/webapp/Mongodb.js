sap.ui.define([
	"sap/ui/model/json/JSONModel",
], function (JSONModel) {
	"use strict";
	return {        
		initializeMongodb: function () {
            const token = "das9j239aDSdkajsdf-fkdah323fhhaosok2nfncdhya";
            const getDocumentsURI =   "https://us-central1-metadatos-002.cloudfunctions.net/getDocuments";
            const createDocumentURI = "https://us-central1-metadatos-002.cloudfunctions.net/createDocument";
            const deleteDocumentURI = "https://us-central1-metadatos-002.cloudfunctions.net/deleteDocument";
            const updateDocumentURI = "https://us-central1-metadatos-002.cloudfunctions.net/updateDocument";
			var oModel = new JSONModel({
                token : token,
                getDocumentsURI : getDocumentsURI,
                createDocumentURI : createDocumentURI,
                deleteDocumentURI : deleteDocumentURI,
                updateDocumentURI : updateDocumentURI,
            });
			return oModel;
		}
	};
});