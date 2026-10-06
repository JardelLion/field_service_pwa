from odoo import models, fields

class ProjectTaskInherit(models.Model):
    _inherit = 'project.task'


    def go_to_application(self):
        pass