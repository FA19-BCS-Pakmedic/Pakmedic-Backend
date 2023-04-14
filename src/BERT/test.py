from flask import Flask,request
import sys
import os
import argparse
import json

app = Flask(__name__)

sys.path.insert(0, r'utils')

from utils import bert_Util as util
from transformers import *

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--config', type=str, required=True,
                        help='path to configuration file')
    args = parser.parse_args()

    # Read the configuration from the file
    with open(args.config, 'r') as f:
        config = json.load(f)

    # Get the URL from the configuration
    url = config['api_url']
else:
    url = os.environ['API_URL']


@app.route('/flask', methods=['GET'])
def flask():
    return "Flask server"

@app.route('/bert', methods=['GET'])
def bert():
    try:

        json  = request.get_json() 

        questions = json['questions']

        passage = json['passage']

        tokenizer = AutoTokenizer.from_pretrained("./models")

        model = TFAutoModelForQuestionAnswering.from_pretrained("./models")

        answers = {}

        for i, q in enumerate(questions):
            answer = util.get_model_answer(model, q, passage, tokenizer)
            answers[q] = answer
            print("Question {}: {}".format(i+1, q))
            print()
            print("Answer: {}".format(answer))
            print()
            print()

        return answers
    
    except Exception as e:
        return {"error": str(e)}, 500

    
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)

