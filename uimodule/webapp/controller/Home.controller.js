sap.ui.define(["com/langure/MetadatosFiori/controller/BaseController",
               "sap/ui/model/json/JSONModel",
               "sap/ui/core/mvc/Controller",
               "sap/m/MessageBox"],
    function (Controller, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("com.langure.MetadatosFiori.controller.Home", {
        onInit(){      
            const routingInterceptor = this.getOwnerComponent().getRouter().getRoute("Home");
            routingInterceptor.attachPatternMatched(this.forceInitializeController, this);
        },
        forceInitializeController (event){
            var authenticated = localStorage.getItem("user_auth");
            if(!authenticated){
                this.getRouter().navTo("Login");            
            }

            var oDialog = this.byId("BusyDialog");
			oDialog.open();

            const getDocumentsURI = this.getModel("mongodb").getProperty("/getDocumentsURI");
            const token = this.getModel("mongodb").getProperty("/token");
            
            fetch(getDocumentsURI.concat("?token=",token)).then(response => response.json()).then(data => {
                var model = new JSONModel();            
                this.getView().setModel(model);                                
                model.setData({
                    documentos:this.processRawData(data.data),
                    busy:false,
                    order:0,
                    enabledButtons:false
                });
                oDialog.close();
            })
        },
        processRawData(rawData){
            
            var rawDocuments = rawData.documents;
            for (let i = 0; i < rawDocuments.length; i++){
                if(rawDocuments[i].metadatos){
                    var rawMetadatos = rawDocuments[i].metadatos;
                    var llaves = 0;
                    for(let j = 0; j < rawMetadatos.length; j++){
                        if(rawMetadatos[j]["llave"]){
                            llaves ++;
                        }                
                    }// metadatos          
                    rawDocuments[i].llaves = llaves;
                }// if metadatos
                else{
                    rawDocuments[i].llaves = llaves;
                    rawDocuments[i].metadatos = [];
                }

                
            }// documents
            return rawDocuments;
        },
        onLogout(){
            const fireAuth = this.getModel("firebase").getProperty("/fireAuth");            
            fireAuth.signOut();
            localStorage.clear();
            this.getRouter().navTo("Login");
        },
        onItemPress(evt){
           var v = evt.getParameters().rowBindingContext.getPath();
           this.getView().getModel().setProperty("/enabledButtons", true);           
           var documentModel = new JSONModel();
           documentModel.setData({
            document:this.getView().getModel().getProperty(v)
           });
           
           sap.ui.getCore().setModel(documentModel,"documentModel");
           this.getRouter().navTo("Detail");
        },
        onCreateNewDocument(){
            var newDocumentModel = new JSONModel({
                newTipoDocumento : "",
                newTipoObjeto : "",
                newSistema : "",
            });

            this.getView().setModel(newDocumentModel, "newDocumentModel");

            // create dialog lazily
			if (!this.pDialog) {
				this.pDialog = this.loadFragment({
					name: "com.langure.MetadatosFiori.view.NewDocument"
				});
			} 
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});

        },
        onCloseAndCreateDialog(){
            sap.ui.require("sap/m/MessageBox");

            // validations.
            var m = this.getView().getModel("newDocumentModel");
            var validated = true;
            if(m.getProperty("/newTipoDocumento").length < 1){
                this.byId("new_tipo_documento").setValueState(sap.ui.core.ValueState.Error);
                validated = false;
            }  
            if(m.getProperty("/newTipoObjeto").length < 1){
                this.byId("new_tipo_objeto").setValueState(sap.ui.core.ValueState.Error);
                validated = false;
            }
            if(m.getProperty("/newSistema").length < 1){
                 this.byId("new_sistema").setValueState(sap.ui.core.ValueState.Error);
                 validated = false;
            }
            if(!validated) return;

            sap.m.MessageBox.show("¿Crear nuevo tipo de documento?", {
                icon: sap.m.MessageBox.Icon.QUESTION,
                title: "CONFIRMACIÓN",
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                emphasizedAction: sap.m.MessageBox.Action.NO,
                onClose: function(oAction) {
                    if (oAction == "YES") {      
                        var oDialog = this.byId("BusyDialog");
                        oDialog.open();
                        
                        const createDocumentURI = this.getModel("mongodb").getProperty("/createDocumentURI");
                        const token = this.getModel("mongodb").getProperty("/token");            
                        const data = {
                            "token" : token,
                            "document": m.getData()
                        };            
                        fetch(createDocumentURI, {                
                            method: "POST",
                            body:JSON.stringify(data)
                        }).then(response => response).then(data =>{                            
                            this.byId("BusyDialog").close();
                            this.byId("newDocumentDialog").close();
                            this.forceInitializeController(); 
                        })
                    }
                }.bind(this)
            });
          },
          onCloseDialog(){
            this.byId("newDocumentDialog").close();     
          },
          onTipoDocumentoLiveChange(){
            this.byId("new_tipo_documento").setValueState(sap.ui.core.ValueState.Success)
          },
          onTipoObjetoLiveChange(){
            this.byId("new_tipo_objeto").setValueState(sap.ui.core.ValueState.Success);
          },
          onSistemaLiveChange(){
            this.byId("new_sistema").setValueState(sap.ui.core.ValueState.Success);
          },
    });
});
