from flask import Flask, request, jsonify
from filter_stocks import filtering_main

app = Flask(__name__)

@app.route('/api/filter_stocks', methods=['POST'])
def filter_stocks():
    data = request.json

    horizon = data.horizon
    risk = data.risk
    one_hot_vector = data.one_hot_vector

    result = filtering_main.stock_filtering(horizon, risk, one_hot_vector)
    
    return jsonify(result)

if __name__ == '__main__':
    # app.run(debug=True)
    print("Flask server running")