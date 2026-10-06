/** @odoo-module */
import { Component, useState } from "@odoo/owl";

import { Login } from "@field_service_pwa/field_service_app/components/login/login";
import { Dashboard } from "@field_service_pwa/field_service_app/components/dashboard/dashboard";

export class Router extends Component {
    static components = { Login, Dashboard};
    static template = 'field_service_pwa.Router';
    static props= {
        userId: { type: Number,optional: true}
    }

    setup() {
        this.state = useState({
            currentPath: 'login',
        })
       
    }

   
}