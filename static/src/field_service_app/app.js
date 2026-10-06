/** @odoo-module **/

import { whenReady } from "@odoo/owl";
import { mountComponent } from "@web/env";
import { Router } from "@field_service_pwa/field_service_app/Router";
whenReady(() => mountComponent(Router, document.body));