sap.ui.define(
    ["sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} BaseController
     */
    function (BaseController, JSONModel) {
        "use strict";

        return BaseController.extend("com.langure.MetadatosFiori.controller.controller.App", {
            onInit() {
                const fireAuth = this.getView().getModel("firebase").getProperty("/fireAuth");
                const user = fireAuth.currentUser;
                fireAuth.onAuthStateChanged((user) => {
                    if (user) {
                      var uid = user.uid;
                      console.log("Listening to user auth change")
                      console.log({user})
                      
                    } else {
                        localStorage.clear();
                    }
                  });
            },
        });
    }
);
