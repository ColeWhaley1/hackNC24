from flask import request, Flask, render_template,jsonify
import json

app = Flask(__name__)

# route to the data from the front end 
@app.route("/", methods=["GET", "POST"])
def receive_data1():
    if request.method == "POST":

        data1 = request.get_data()
        data1 = json.loads(data1)
        return jsonify(data1)

    elif request.method == "GET":

        return render_template("index.html")

if __name__ == "__main__":
    app.run(debug = True, port = 5001)
    