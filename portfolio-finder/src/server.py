from flask import Flask, request, jsonify
from filter_stocks import filtering_main, get_logo_from_ticker
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

@app.route('/api/filter_stocks', methods=['POST'])
def filter_stocks():
    data = request.get_json()

    horizon = data["horizon"]
    risk = data["risk"]
    ohv = data["ohv"]

    result = filtering_main.stock_filtering(horizon, risk, ohv)
    
    return jsonify(result)

@app.route('/api/get_logo', methods=['POST'])
def get_logo():
    data = request.get_json()

    ticker = data["ticker"]

    result = get_logo_from_ticker.get_logo_from_ticker(ticker)
    
    return jsonify({
        "logo": result
    })

if __name__ == '__main__':
    app.run(port = 5001, debug=True)
    print("Flask server running")