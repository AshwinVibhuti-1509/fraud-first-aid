"""Local demo server. Run: python app.py. Do not expose the dev server publicly."""
import os
from flask import Flask, jsonify, request, send_from_directory, Response
from werkzeug.exceptions import BadRequest, RequestEntityTooLarge
from engine import QUESTIONS, VERSION, InputError, assess, summary
from intake import interpret, KINDS
from evidence import modes, sanitized_png, analyze, EvidenceError
import time
from collections import deque

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024
# Per-request boundary. The image-only endpoint has its own upper bound.
@app.before_request
def limits():
    if request.path == '/api/evidence/analyze':
        request.max_content_length = 3 * 1024 * 1024
    else:
        request.max_content_length = 16 * 1024

# In-process request-cost limit. Does not persist addresses or case contents.
_image_attempts = deque()


@app.after_request
def headers(response):
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'no-referrer'
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'"
    return response

@app.get('/')
def index():
    return send_from_directory(app.static_folder, 'guided.html')

@app.get('/classic')
def classic():
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

@app.get('/api/intake/options')
def intake_options():
    return jsonify(categories=KINDS, image=modes())

@app.post('/api/intake/interpret')
def interpret_description():
    data=payload()
    if not isinstance(data,dict) or set(data)-{'description','category'}:
        raise InputError('Unsupported intake request.')
    try:
        return jsonify(interpret(data.get('description',''),data.get('category','unknown')))
    except ValueError as err: raise InputError(str(err)) from err

@app.post('/api/evidence/analyze')
def image_analysis():
    data=payload()
    if not isinstance(data,dict) or set(data)-{'image','mode','consent','sanitized_preview_confirmed'}:
        raise InputError('Unsupported evidence request.')
    if data.get('consent') is not True or data.get('sanitized_preview_confirmed') is not True:
        raise InputError('Explicit consent and image-preview confirmation are required.')
    now=time.monotonic()
    while _image_attempts and _image_attempts[0]<now-60: _image_attempts.popleft()
    if len(_image_attempts)>=12: return jsonify(error='Image analysis is temporarily limited; try manual intake.'),429
    _image_attempts.append(now)
    try:
        png=sanitized_png(data.get('image'))
        return jsonify(analyze(png,data.get('mode')))
    except EvidenceError as err: raise InputError(str(err)) from err

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
