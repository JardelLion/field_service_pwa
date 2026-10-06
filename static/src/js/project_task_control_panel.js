import { ProjectTaskControlPanel } from "@project/views/project_task_control_panel/project_task_control_panel"
import { patch } from "@web/core/utils/patch";

patch(ProjectTaskControlPanel.prototype, {
    async onClickExtrenalLink() {
        // Redireciona o browser para a página HTTP do PWA
        window.open('/field_service_pwa/login', '_blank');
    }
});
