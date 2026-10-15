/** @odoo-module */
import { Component, useState } from "@odoo/owl";


export class TaskModal extends Component {
    static template = 'field_service_pwa.task_modal';
    static props = {
        task: { type: Object, optional: true },
        users: { type: Object, optional: true },
        isModalOpen: { type: Boolean, optional: true },
        onClose: { type: Function, optional: true }
    }

    setup() {
        this.state = useState({
        })
       
    }

    getUserIcon(userId){
        if(userId){
            const userdData = this.props.users.find(user => user.id === parseInt(userId))

            return userdData.image_128

        }
        return null
        
    }

    toggleModal(){
        this.props.isModalOpen = !this.props.isModalOpen;
    }

    onClose(){
        this.props.onClose();
    }

   
}