from odoo import http
from odoo.http import route
from odoo.http import request
import json
from datetime import date, datetime
from odoo.tools import file_open
from odoo.modules.module import get_module_path



class FieldServicePWAController(http.Controller):

    def _json_serializer(self, obj):
        """Serializa objetos que não são nativamente JSON, como datetime"""
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return str(obj)
    def _get_manifest_data(self, portal):
        # Use the correct method name here
        data = portal._generate_schema_pwa() if hasattr(portal, '_generate_schema_pwa') else {}
        return data

    @http.route('/field_service_pwa/health', type='json', auth='public', csrf=False)
    def check_health(self):
        """
        Returns True to verify that the server is reachable and responding.
        Using auth='public' allows unauthenticated users or offline PWA 
        sessions to reach the endpoint if they hit the server.
        """
        return True

    @route(["/field_service_pwa/login"], auth="public", website=True)
    def standalone_app(self, **kwargs):
        
        return request.render('field_service_pwa.standalone_template', {
            'session_info': request.env['ir.http'].get_frontend_session_info(),
        })

    @route("/field_service_pwa/auth", methods=['POST'], type='http', auth='public', cors='*', csrf=False)
    def login(self, **kwargs):
        data = request.httprequest.json
        email = data.get("email")
        password = data.get("password")
        employee = request.env['hr.employee'].sudo().search([
            ('work_email', '=', email),
            ('pin', '=', password)
        ], limit=1)

        user_id = employee.user_id

        if not user_id:
            return request.make_response(
                json.dumps({'success': False, "data": {}}),
                status=401
            )
    
        payload = {
            'id': employee.id,
            'name': employee.name,
            'workEmail': employee.work_email,
            'pin': password,
            'department': employee.department_id.name if employee.department_id else '',
            'avatar_128': employee.avatar_128.decode('utf-8') if employee.avatar_128 else None,
            'avatar_1024': employee.avatar_1024.decode('utf-8') if employee.avatar_128 else None,
            'tz': employee.tz,
            'user_id': user_id.id
        }
        return request.make_response(json.dumps({"success": True,"data": payload}))
    

    @http.route('/sw/field_service_pwa/sw-service_worker.js', type='http', auth='public', methods=['GET'], readonly=True, csrf=False)
    def service_worker(self, **kwargs):
        # We need the scope to match the dynamic path of the portal
        # The browser checks 'Service-Worker-Allowed' against the registration scope
        response = request.make_response(
            self._get_service_worker_content(),
            [
                ('Content-Type', 'text/javascript'),
                ('Service-Worker-Allowed', '/'), 
                ('Cache-Control', 'no-cache, no-store, must-revalidate'),
            ]
        )
        return response
    
    @http.route('/offline', type='http', auth='public', website=True)
    def offline_page(self, **kwargs):
        # This renders a simple template; ensure you define this template in your XML
        pass
    
    

    def _get_service_worker_content(self):
        with file_open('field_service_pwa/static/src/field_service_app/service_worker.js') as f:
            return f.read()

    @http.route('/field_service_pwa/manifest.json', type='http', csrf=False, auth='public', methods=['GET'], readonly=True)
    def manifest(self):
        icon_path = '/field_service_pwa/static/description/icon.png'
        
        manifest = {
            "id": "/field_service_pwa/",
            "name": "Field Service Pwa",
            "short_name": "Field Service",
            "scope": "/field_service_pwa/",
            "start_url": "/field_service_pwa/login",
            "display": "standalone",
            "background_color": "#ffffff",
            "theme_color": "#ffffff",
            "icons": [
                {
                    "src": icon_path,
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose": "any maskable"
                },
                {
                    "src": icon_path,
                    "sizes": "512x512",
                    "type": "image/png",
                    "purpose": "any maskable"
                }
            ]
        }
        return request.make_json_response(manifest)