sap.ui.define([
	"sap/ui/model/json/JSONModel",
], function (JSONModel) {
	"use strict";

    const firebaseConfig = {
        apiKey: "AIzaSyBDSG_c2FdS4R8Eb-puKfU1bmh07hW8FBo",
        authDomain: "metadatos-002.firebaseapp.com",
        projectId: "metadatos-002",
        storageBucket: "metadatos-002.appspot.com",
        messagingSenderId: "965213552699",
        appId: "1:965213552699:web:a4148f009d9e488dafdc1e"
        };

	return {
		initializeFirebase: function () {
			var app = firebase.initializeApp(firebaseConfig);
			const fireAuth = firebase.auth()
			const oFirebase = {
				fireAuth: fireAuth
			};
			var fbModel = new JSONModel(oFirebase);
			return fbModel;
		}
	};
});