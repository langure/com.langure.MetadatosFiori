# MetadatosFiori

Metadatos Manager built on SAPUI5

 Known issues:

 On index.html the default bootsrap setting: 

 data-sap-ui-preload="sync"

 means that a "component-preload" needs to be sync with its environment, such as, when being run inside a fiori container (workbench). Running the app standalone, as it currently is, will throw the following errors that can be safely ignored:

 Component-preload.js net::ERR_ABORTED 404 (Not Found)
 failed to load JavaScript resource: com/langure/metadatosfiori/Component-preload.js -  sap.ui.ModuleSystem

 It is possible prevent these errors from appearing by configuring the bootsrap as data-sap-ui-preload="off", however, this means that the application is being blocked from running while the SAPUI5 libraries are being loaded from the CDN. This greatly degrades the performance during initialization.