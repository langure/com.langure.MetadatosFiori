sap.ui.define(["com/langure/MetadatosFiori/controller/BaseController",
               "sap/ui/model/json/JSONModel",
               ], 
    function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.langure.MetadatosFiori.controller.Detail", {
        onInit(){
            const routingInterceptor = this.getOwnerComponent().getRouter().getRoute("Detail");
            routingInterceptor.attachPatternMatched(this.forceInitializeController, this);
        },
        forceInitializeController: function(event) {
            var authenticated = localStorage.getItem("user_auth");
            if(!authenticated){
                this.getRouter().navTo("Login");            
            }
            var documentModel = sap.ui.getCore().getModel("documentModel");
            if(!documentModel){
                this.getRouter().navTo("Home");
            }
            else
            {
                // additional data is required for this local version of the model
                var oDocumentModel = new JSONModel();
                oDocumentModel.setData({
                    document : documentModel.getProperty("/document"),
                    enabledButtons : false,
                    needsSaving : false
                });
                this.getView().setModel(oDocumentModel);
            }
          },
          onBack(){
            this.getRouter().navTo("Home");
          },
          onItemPress(evt){
            var v = evt.getParameters().rowBindingContext.getPath();            
            var localModel = this.getView().getModel();
            var selectedMetadato = localModel.getProperty(v);
            localModel.setProperty("/enabledButtons", true);
            localModel.setProperty("/selectedMetadato", selectedMetadato);
            // create dialog lazily
			if (!this.pEditDialog) {
				this.pEditDialog = this.loadFragment({
					name: "com.langure.MetadatosFiori.view.EditMetadato"
				});
			} 
			this.pEditDialog.then(function(pEditDialog) {
				pEditDialog.open();
			});
          },
          onSaveAndCloseDialog(){
            this.byId("editMetadatoDialog").close();
          },
          onDeleteDocument(){
            sap.ui.require("sap/m/MessageBox");
            sap.m.MessageBox.show("¿Borrar tipo de documento? Esta acción no se puede deshacer.", {
            icon: sap.m.MessageBox.Icon.WARNING,
            title: "CONFIRMACIÓN",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            emphasizedAction: sap.m.MessageBox.Action.NO,
            onClose: function(oAction) {
                if (oAction == "YES") {      
                    const deleteDocumentURI = this.getModel("mongodb").getProperty("/deleteDocumentURI");
                        const token = this.getModel("mongodb").getProperty("/token");            
                        const data = {
                            "token" : token,
                            "tipo_documento": this.getView().getModel().getProperty("/document/tipo_documento")
                        };            
                        fetch(deleteDocumentURI, {                
                            method: "POST",
                            body:JSON.stringify(data)
                        }).then(response => response).then(data =>{ 
                            console.log(data.statusText);                           
                            this.getRouter().navTo("Home");
                        }).catch(error =>{
                            console.log(error);
                        });
        }}.bind(this)});},
        onDeleteMetadato(){
            
            console.log("on delete metadato");
            var localModel = this.getView().getModel();
            var selectedMetadato = localModel.getProperty("/selectedMetadato/").campo;
            var selectedDocumento = localModel.getProperty("/document");

            selectedDocumento.metadatos = selectedDocumento.metadatos.filter(function(value, index, arr){
                return value.campo !== selectedMetadato
            });
            

            sap.ui.require("sap/m/MessageBox");
            sap.m.MessageBox.show("Desea eliminar este metadato?", {
            icon: sap.m.MessageBox.Icon.WARNING,
            title: "CONFIRMACIÓN",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            emphasizedAction: sap.m.MessageBox.Action.NO,
            onClose: function(oAction) {
                if (oAction == "YES") {      
                    const updateDocumentURI = this.getModel("mongodb").getProperty("/updateDocumentURI");
                        const token = this.getModel("mongodb").getProperty("/token");            
                        const data = {
                            "token" : token,
                            "document": selectedDocumento
                        };
                        fetch(updateDocumentURI, {                
                            method: "POST",
                            body:JSON.stringify(data)
                        }).then(response => response).then(data =>{ 
                            console.log(data.statusText);       
                            var documentModel = sap.ui.getCore().getModel("documentModel");
                            var oDocumentModel = new JSONModel();
                            oDocumentModel.setData({
                                document : selectedDocumento,
                                enabledButtons : false,
                                needsSaving : false
                            });
                            this.getView().setModel(oDocumentModel);
                        }).catch(error =>{
                            console.log(error);
                        });
        }}.bind(this)});       
        this.byId("editMetadatoDialog").close();
        },
        onAgregarMetadato(){
            let oNewMetadatoModel = new JSONModel(
                {
                    llave : false,
                    campo : "", 
                    orden : "",
                    metadato : "",
                    description_campo : "",
                    tipo_dato : "",
                    longitud_dato: "",
                    ayuda_busqueda : "",
                    formato : "",
                    metadato_autorizacion : "",
                    frente : "",
                    descripcion_homologada : "",
                    metadato_homologado: "",
                }
            );
            this.getView().setModel(oNewMetadatoModel, "oNewMetadatoModel");

            if (!this.pDialog) {
				this.pDialog = this.loadFragment({
					name: "com.langure.MetadatosFiori.view.CreateMetadato"
				});
			} 
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
        },
        onCancelarNewMetadato(){
            this.byId("createMetadatoDialog").close();
        },
        onCloseNewMetadato(){
            let oNewMetadatoModel = this.getView().getModel("oNewMetadatoModel");
            var validated = true;
            if(oNewMetadatoModel.getProperty("/campo").length < 1){
                this.byId("new_campo").setValueState(sap.ui.core.ValueState.Error);
                validated = false;
            }
            if(oNewMetadatoModel.getProperty("/orden").length < 1){
                this.byId("new_orden").setValueState(sap.ui.core.ValueState.Error);
                validated = false;
            }
            if(oNewMetadatoModel.getProperty("/metadato").length < 1){
                this.byId("new_metadato").setValueState(sap.ui.core.ValueState.Error);
                validated = false;
            }            
            if(!validated) return;

            let oModel = this.getView().getModel();
            let metadatos = oModel.getProperty("/document/metadatos");
            metadatos.push(oNewMetadatoModel.getData());
            oModel.setProperty("/document/metadatos", metadatos);

            sap.ui.require("sap/m/MessageBox");
            sap.m.MessageBox.show("¿Guardar metadato?", {
            icon: sap.m.MessageBox.Icon.WARNING,
            title: "CONFIRMACIÓN",
            actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
            emphasizedAction: sap.m.MessageBox.Action.NO,
            onClose: function(oAction) {
                if (oAction == "YES") {      
                    const updateDocumentURI = this.getModel("mongodb").getProperty("/updateDocumentURI");
                        const token = this.getModel("mongodb").getProperty("/token");            
                        const data = {
                            "token" : token,
                            "document": this.getView().getModel().getProperty("/document")
                        };
                        fetch(updateDocumentURI, {                
                            method: "POST",
                            body:JSON.stringify(data)
                        }).then(response => response).then(data =>{ 
                            console.log(data.statusText);                           
                        }).catch(error =>{
                            console.log(error);
                        });
        }}.bind(this)});

            this.byId("createMetadatoDialog").close();
        },
        onCampoLiveChange(){
            this.byId("new_campo").setValueState(sap.ui.core.ValueState.Success)
        },
        onOrdenLiveChange(){
            this.byId("new_orden").setValueState(sap.ui.core.ValueState.Success)
          }, 
          onMetadatoLiveChange(){
            this.byId("new_metadato").setValueState(sap.ui.core.ValueState.Success)
        },                       
    });    
});
