/** @odoo-module **/

import { Component, useState, onWillStart } from "@odoo/owl";
import { rpc } from "@web/core/network/rpc";
import { saveFrom, getData } from "@field_service_pwa/field_service_app/db/index_db";

export class Dashboard extends Component {
    static template = 'field_service_pwa.dashboard';
    static props = {
        userId: { type: Number, optional: true },
        onnavigate: { type: Function, optional: true }
    };

    setup(){
        this.state = useState({
            standard_view: 'project',
            tasks: [],
            users: [],
            projects: []
        })

        onWillStart(async () => {
            await this.syncTask()
            await this.syncUsers()
          //  await syncProject()
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
                        saveFrom('task', 'task', {
                            ...record,
                            id: record.id,
                            createDate: Date.now(),
                        })
                    )
                );
            } else {
                console.error("Failed to load tasks:", response?.error);
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
            }
        } catch (error) {
            console.error("Network or RPC error during task sync:", error);
        } finally {
            this.state.loading = false;
        }
    }

    async syncProject(){
        const project = await rpc(`/field_service_pwa/project/${this.props.userId}`);

    }

    getUserIcon(userId){
        if(userId){
            const userdData = this.state.users.find(user => user.id === parseInt(userId))

            return userdData.image_128

        }
        return null
        
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

}