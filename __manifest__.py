{
    'name': 'Field Service PWA',
    'version': '1.0.0',
    'description': 'Field Service PWA Description',
    'summary': 'Field Service PWA Summary',
    'author': 'Jardel Elias Bernardo',
    'website': '',
    'license': 'LGPL-3',
    'category': '',
    'depends': [
        'project','industry_fsm', 'web'
    ],
    'data': [
        "data/server_actions.xml",
        'views/standalone_app.xml',
            
        ],
    'demo': [],
    'auto_install': False,
    'application': False,
     'assets': {
        'web.assets_backend':[
              "field_service_pwa/static/src/xml/project_task_control_panel.xml",
              'field_service_pwa/static/src/js/project_task_control_panel.js'
          ],
        'field_service_pwa.assets_public_field_service_pwa': [
            ('include', 'web._assets_core'),
            ('remove', 'web/static/src/core/utils/transitions.scss'),
            ('remove', 'web/static/src/core/**/*.scss'),

            "field_service_pwa/static/src/field_service_app/**/*",
            "field_service_pwa/static/src/field_service_app/componens/**/*",
            "field_service_pwa/static/src/output.css"
        ]     
    },
}