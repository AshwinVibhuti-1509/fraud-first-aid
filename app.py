"""Local demo server. Run: python app.py. Do not expose the dev server publicly."""
import os
from flask import Flask, jsonify, request, send_from_directory, Response
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge
from engine import QUESTIONS, VERSION, InputError, assess, summary

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024

@app.after_request
def headers(response):
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    return response

@app.get('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.get('/api/health')
def health():
    return jsonify(status='ok', version=VERSION)

@app.get('/api/questions')
def questions():
    return jsonify(questions=QUESTIONS, version=VERSION)

def payload():
    if not request.is_json:
        raise InputError('Use application/json.')
    return request.get_json()

@app.post('/api/assess')
def assessment():
    return jsonify(assess(payload()))

@app.post('/api/summary')
def export():
    result = assess(payload())
    return Response(summary(result), mimetype='text/plain', headers={'Content-Disposition': 'attachment; filename="fraud-first-aid-summary.txt"'})

@app.errorhandler(InputError)
@app.errorhandler(BadRequest)
def invalid(error):
    return jsonify(error=str(error) if isinstance(error, InputError) else 'Invalid JSON request.'), 400

@app.errorhandler(RequestEntityTooLarge)
def too_large(error):
    return jsonify(error='Request too large. Keep notes short.'), 413

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default=os.environ.get('HOST', '127.0.0.1'))
    parser.add_argument('--port', type=int, default=int(os.environ.get('PORT', '5000')))
    parser.add_argument('--strictPort', action='store_true')
    args = parser.parse_args()
    app.run(host=args.host, port=args.port, debug=False)
