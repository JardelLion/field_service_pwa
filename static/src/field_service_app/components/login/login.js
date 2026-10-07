/** @odoo-module **/

import { Component, useState } from "@odoo/owl";
import { saveFrom, getAllFrom } from "@field_service_pwa/field_service_app/db/index_db";

const DB_NAME = 'hr.employee';
const STORE = 'hr.employee'

export class Login extends Component {
    static template = 'field_service_pwa.Login';
    static props = {
        userId: { type: Number,optional: true},
        onnavigate: { type: Function, optional: true}
    };

    setup(){
        this.state = useState({
            email: "",
            password: "",
            loading: false,
            error: null,
        })
    }

    async onSubmit() {
       this.state.loading = true;
       this.state.error = null;

       const payload = {
        email: this.state.email,
        password: this.state.password
       }
       try {
            const response = await this.fetchWithTimeout('/field_service_pwa/auth', {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }, 5000)

            if (!response.ok) throw new Error (`Error: ${response.status}`)
            else {
                const result = await response.json();
                if (result.success){
                    const user_id = result.data.user_id
                    const data = {
                    ...result.data
                    }
                    await saveFrom(DB_NAME, STORE, data)
                    this.state.loading = false;
                    this.props.userId = user_id;
                    this.props.onnavigate('dashboard', user_id)
                } 
            }
       } catch(err){
       console.warn("Server unavaible, trying offline login ", err)
         const users = await getAllFrom(DB_NAME, STORE)
            const workEmail = this.state.email;
            const pin = this.state.password;
            const idLogin = await this.ValidateLoginOffline(users, workEmail, pin)
            try{
                if (idLogin){
                       this.state.loading = false;
                } else {
                    this.state.error = "Email ou senha incorretos.";
                    this.state.loading = false;
                }
            } catch (err) {
                console.error(`Error no Login ${err}`)
                this.state.error = "Email ou senha incorretos.";
                this.state.loading = false;
            }
       }
    }

    async fetchWithTimeout(url, options, timeout = 5000) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            return response;
        } finally {
            clearTimeout(id);
        }
    }

    async ValidateLoginOffline(users, workEmail, pin){
        let id = null;
        users.forEach((user) => {
            if(user.workEmail === workEmail && user.pin === pin) {
                //return the id of the user
                id = user.id;
                return id;
            }
        })
        return id
    }

}