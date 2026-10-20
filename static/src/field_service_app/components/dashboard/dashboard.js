/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";
import { saveFrom, getAllFrom } from "@field_service_pwa/field_service_app/db/index_db";
import { TaskModal } from "@field_service_pwa/field_service_app/components/taskModal/task_modal";
export class Dashboard extends Component {
    static template = 'field_service_pwa.dashboard';
    static components = {
        TaskModal
    }
    static props = {
        userId: { type: Number, optional: true },
        onnavigate: { type: Function, optional: true }
    };

    setup(){
        this.state = useState({
            standard_view: 'project',
            tasks: [],
            users: [],
            projects: [],
            task: {},
            partners: [],
            isModalOpen: false
        })

        onWillStart(async () => {
            this.state.loading = true;
            await this.syncTask();
            await this.syncUsers();
            await this.syncProject();
            await this.syncPartners();
        })
    }

    async syncTask() {
        if (!this.props.userId) {
            console.warn("Cannot sync tasks: userId is missing from props.");
            return;
        }

        try {
            // Send payload object matching controller method parameters
            const response = await rpc("/field_service_pwa/task", {
                user_id: this.props.userId,
            });

            if (response && response.success) {
                this.state.tasks = [...response.data];
                const records = response.data
                await Promise.all(
                    records.map((record) =>
                        saveFrom('project.task', 'project.task', {
                            ...record,
                            id: record.id,
                            createDate: Date.now(),
                        })
                    )
                );
            } else {
                console.error("Failed to load tasks:", response?.error);
                const tasks = await getAllFrom('project.task', 'project.task')
                this.states.tasks = [...tasks]
            }
        } catch (error) {
            console.error("Network or RPC error during task sync:", error);
        } finally {
            this.state.loading = false;
        }
    }

    async syncUsers(){
         try {
            // Send payload object matching controller method parameters
            const response = await rpc("/field_service_pwa/res_users")

            if (response && response.success) {
                this.state.users = [...response.data];
                const records = response.data
                await Promise.all(
                    records.map((record) =>
                        saveFrom('res.users', 'res.users', {
                            ...record,
                            id: record.id,
                            createDate: Date.now(),
                        })
                    )
                );
            } else {
                console.error("Failed to load tasks:", response?.error);
                const users = await getAllFrom('res.users', 'res.users')
                this.states.tasks = [...users]
            }
        } catch (error) {
            console.error("Network or RPC error during task sync:", error);
        } finally {
            this.state.loading = false;
        }
    }

    async syncProject() {
        if (!this.props.userId) {
            console.warn("Cannot sync project: userId is missing from props.");
            return;
        }

        try {
            // Send payload object matching controller method parameters
            const response = await rpc("/field_service_pwa/project", {
                user_id: this.props.userId,
            });

            if (response && response.success) {
                this.state.projects = [...response.data];
                const records = response.data
                await Promise.all(
                    records.map((record) =>
                        saveFrom('project.project', 'project.project', {
                            ...record,
                            id: record.id,
                            createDate: Date.now(),
                        })
                    )
                );
            } else {
                console.error("Failed to load projects:", response?.error);
                const projects = await getAllFrom('project.project', 'project.project')
                this.states.projects = [...projects]
            }
        } catch (error) {
            console.error("Network or RPC error during project sync:", error);
        } finally {
            this.state.loading = false;
        }
    }

    async syncPartners(){
         if (!this.state.projects || !this.state.tasks) {
            console.warn("Cannot sync Partners: userId is missing from props.");
            return;
        }

        let partners = [];

        if(this.state.projects){
            this.state.projects.forEach(project => {
                if(project.partner_id){
                    partners.push(project.partner_id[0])
                }
            });
        }
        if(this.state.tasks){
            this.state.tasks.forEach(task => {
                if(task.partner_id){
                    partners.push(task.partner_id[0])
                }
            })
        }

        try {
            // Send payload object matching controller method parameters
            const response = await rpc("/field_service_pwa/partners", {
                partners: partners,
            });

            if (response && response.success) {
                this.state.partners = [...response.data];
                const records = response.data
                await Promise.all(
                    records.map((record) =>
                        saveFrom('res.partner', 'res.partner', {
                            ...record,
                            id: record.id,
                            createDate: Date.now(),
                        })
                    )
                );
            } else {
                console.error("Failed to load Partners:", response?.error);
                const partners = await getAllFrom('res.partner', 'res.partner')
                this.states.partners = [...partners]
            }
        } catch (error) {
            console.error("Network or RPC error during Partners sync:", error);
        } finally {
            this.state.loading = false;
        }

    }


    getUserIcon(userId){
        if(this.state.standard_view === 'project'){
            userId = userId[0]
        }
        if(userId){
            const userdData = this.state.users.find(user => user.id === parseInt(userId))

            return userdData.image_128

        }
        return null
        
    }
    getPartnerObject(partnerArray){
        const partner_id = this.state.partners.find(partner_id => partner_id.id === partnerArray[0])
        return partner_id
    }

    setView(view){
        this.state.standard_view = view;
    }

    /**
     * Formata duas datas/horas no padrão: "Oct 8, 9:00 AM ➔ 5:30 PM"
     * @param {string} startStr - ex: "2026-10-08 09:00:00"
     * @param {string} endStr   - ex: "2026-10-08 17:30:00"
     */
    formatTaskTimeRange(startStr, endStr) {
        if (!startStr) return "";

        const startDate = new Date(startStr);
        
        // Formata o mês e dia (ex: "Oct 8")
        const dateFormatted = startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });

        // Formata a hora inicial (ex: "9:00 AM")
        const startTimeFormatted = startDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });

        // Formata a hora final se existir (ex: "5:30 PM")
        let endTimeFormatted = "";
        if (endStr) {
            const endDate = new Date(endStr);
            endTimeFormatted = endDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        }

        return {
            date: dateFormatted,
            startTime: startTimeFormatted,
            endTime: endTimeFormatted,
        };
    }

    openTask(task){
        if(Object.keys(task).length > 0){
            this.state.task = task;
            this.state.isModalOpen = true;
        }
    }

    onClose(){
        this.state.isModalOpen = false;
    }

}