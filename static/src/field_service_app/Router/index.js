/** @odoo-module */
import { Component, useState } from "@odoo/owl";

import { App } from "@field_service_pwa/field_service_app/components/app/main";

export class Router extends Component {
    static template = 'field_service_pwa.Router';
    static components = { App };

    setup() {
        this.state = useState({
            currentPath: 'login',
        })
       
    }

   
}