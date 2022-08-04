sap.ui.define([
	"sap/ui/model/json/JSONModel",
], function (JSONModel) {
	"use strict";

    const firebaseConfig = {

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