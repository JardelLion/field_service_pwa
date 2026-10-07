/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { Login } from "@field_service_pwa/field_service_app/components/login/login";
import { Dashboard } from "@field_service_pwa/field_service_app/components/dashboard/dashboard";
import { TaskModal } from "@field_service_pwa/field_service_app/components/taskModal/task_modal";


export class App extends Component {
    static template = 'field_service_pwa.app';
    static components = { Login, Dashboard, TaskModal};
    static props = {
        userId: { type: Number, optional: true },
        onnavigate: { type: Function, optional: true}
    };
    setup(){
        const initialRoute = this.parseCurrentUrl();
        this.state = useState({
            currentPath: initialRoute.path,
            userId: initialRoute.userId
        
        })

        window.addEventListener('popstate', ()=> {
            const route = this.parseCurrentUrl();
            this.state.currentPath = route.path;
            this.state.userId = route.userId;
        })

    }

    parseCurrentUrl(){
        const pathSegments = window.location.pathname.split("/").filter(Boolean);
        const lastSegments = pathSegments[pathSegments.length -1];

        if (lastSegments && !isNaN(lastSegments)){
            return {
                path: 'dashboard',
                userId: parseInt(lastSegments, 10),
            };
        }
        return {
            path: 'login',
            userId: null,
        }
    }

    setPage(page, user_id){
        this.props.userId = user_id;
        this.state.userId = user_id;
        this.state.currentPath = page;

        // Build the target URL path
        let newUrl = "/field_service_pwa/";
        if (page === "dashboard" && user_id) {
            newUrl += user_id; // Results in: /field_service_pwa/5
        } else {
            newUrl += page;   // Results in: /field_service_pwa/login
        }

        // Update browser URL without reloading the page
        window.history.pushState({ page, user_id }, "", newUrl);
    }

}