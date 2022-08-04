sap.ui.define(["com/langure/MetadatosFiori/controller/BaseController",
               "sap/ui/model/json/JSONModel",
               "sap/m/MessageToast"
], 
function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.langure.MetadatosFiori.controller.Login", {
        onInit(){
            var authenticated = localStorage.getItem("user_auth");
            console.log("Auth:")
            console.log({authenticated})
            if(authenticated){
                this.getRouter().navTo("Home");            
            }

            var oLocalData = {
                usuario : "admin@example.com",
                password : "12345678"
            }
            var oLocalModel = new JSONModel(oLocalData);
            this.getView().setModel(oLocalModel);
        },
        onLoginTap(){
            var data = this.getView().getModel().getData();
            if (data.usuario.length < 4 || data.usuario.password < 3){
                MessageToast.show("Please fill in your credentials.");
                return;
            }            

            const fireAuth = this.getModel("firebase").getProperty("/fireAuth");
            fireAuth.signInWithEmailAndPassword(data.usuario, data.password).then((userCredential) => {
                var oAuthData = {
                    currentUser:{
                        authenticated : true,
                        token : userCredential    
                    }
                };
                localStorage.clear();
                localStorage.setItem("user_auth", 1);
                this.getRouter().navTo("Home")  
            }).catch(function (error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                MessageToast.show(error.message);

            });
        }
    });
});
