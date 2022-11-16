sap.ui.define(["com/langure/MetadatosFiori/controller/BaseController",
               "sap/ui/model/json/JSONModel",
               "sap/ui/core/mvc/Controller",
               'sap/m/MessageToast', 
               "sap/m/MessageBox",
               "com/langure/MetadatosFiori/libs/FileSaver"],
    function (Controller, JSONModel, MessageToast, MessageBox, FileSaver) {
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
                let documentos = this.processRawData(data.data);
                model.setData({
                    documentos: documentos,
                    busy:false,
                    order:0,
                    enabledButtons:false
                });                
                let sModel = this.createStadistics(documentos);
                this.getView().setModel(sModel, "stadisticsModel");
                oDialog.close();
            })
        },
        createStadistics(documentos){    
            let metadatos = [], sistemas = new Set(), campos_llave = 0, frentes = new Set();
            
            for(let i = 0; i < documentos.length; i++){
                metadatos.push(...documentos[i].metadatos);
                let sis = documentos[i].sistemas;
                for(let j = 0; j < documentos[i].sistemas.length; j++)
                    sistemas.add(documentos[i].sistemas[j].sistema);
                for(let j = 0; j < documentos[i].metadatos.length; j++){  
                    let m = metadatos[j];
                    if(m !== undefined){
                        if(metadatos[j]["llave"]){
                            campos_llave++;
                        }// if campo llave  
                    }// if there are metadatos
                }// for metadatos
            }// for documentos

            for(let i = 0; i < metadatos.length; i++){
                frentes.add(metadatos[i]["frente"]);
            }            
            let stadisticsModel = new JSONModel(); 
            stadisticsModel.setData(
                {
                    sMetadatos : metadatos.length,
                    sSistemas : sistemas.size,
                    sCamposLlave : campos_llave,
                    sFrentes : frentes.size
                }
            );
            return stadisticsModel;
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
                multiple : false,
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
        tipoObjetoIsUnique(new_tipo_objeto){            
            var currentDocumentos = this.getView().getModel().getProperty("/documentos");                        
            for(let i = 0; i < currentDocumentos.length; i++){
                if (new_tipo_objeto === currentDocumentos[i]["tipo_objeto"]) return false;
            }
            return true;
        },
        onCloseAndCreateNewDocument(){
      
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
            // tipo de objeto needs to be unique
            if(!this.tipoObjetoIsUnique(m.getProperty("/newTipoObjeto"))){
                this.byId("new_tipo_objeto").setValueState(sap.ui.core.ValueState.Error);
                validated = false;
                MessageToast.show("El nombre de 'Tipo de Objeto' se encuentra repetido");
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
          onGetCSV(){
            
          },
          onGetJSON(){
            debugger
            var blob = new Blob(["Prueba"], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "prueba.json");
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
