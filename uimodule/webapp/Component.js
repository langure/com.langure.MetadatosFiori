sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "com/langure/MetadatosFiori/model/models",
        "./Firebase",
        "./Mongodb",
    ],
    function (UIComponent, Device, models, Firebase, Mongodb) {
        "use strict";

        return UIComponent.extend("com.langure.MetadatosFiori.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                // set firebase model
                this.setModel(Firebase.initializeFirebase(), "firebase");
                // set MongoDB model
                this.setModel(Mongodb.initializeMongodb(), "mongodb");
            }
        });
    }
);