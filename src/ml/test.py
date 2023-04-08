from flask import Flask,request
import sys
import jsonpickle
import requests

from io import BytesIO
import io
import os
import argparse
import json


import os
import argparse
import json



app = Flask(__name__)

sys.path.insert(0, r'utils')

from utils import Xray_util as util
from utils import Retinopathy_util as retinopathy
from utils import RiskOfDeath_util as riskOfDeath
from utils import RecommendCompound_util as recommendCompound
from utils import BrainMRI_util as mriUtil

from utils import Template_util as template


import requests


import numpy as np

IMAGE_DIR = "sample_ChestXray"
MRI_DIR = "sample_BrainMRI"

labels = ['Cardiomegaly', 
        'Emphysema', 
        'Effusion', 
        'Hernia', 
        'Infiltration', 
        'Mass', 
        'Nodule', 
        'Atelectasis',
        'Pneumothorax',
        'Pleural_Thickening', 
        'Pneumonia', 
        'Fibrosis', 
        'Edema', 
        'Consolidation']

to_show = np.array(['Cardiomegaly', 'Edema', 'Mass', 'Pneumothorax'])


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


url = url+"/api/v1/files/"


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


url = url+"/api/v1/files/"

@app.route('/flask', methods=['GET'])
def flask():
    return "Flask server"

@app.route('/chestXray', methods=['GET'])
def xray():
    try:

        file = request.query_string.decode('utf-8')

        image = requests.get(url+file)

        with open(IMAGE_DIR+'/xray.png', 'wb') as f:
            f.write(image._content) 
        
        model = util.load_model('ML_models/Xray_model', compile=False)

        buffer = util.compute_gradcam(model, 'xray.png', IMAGE_DIR, labels, to_show)

        return buffer
        
    except Exception as e:
        return {"error": str(e)}, 500


@app.route('/brainMRI', methods=['GET'])
def mri():
    try:
        file = request.query_string.decode('utf-8')

        image = requests.get(url+file)

        with open(MRI_DIR+'/mri.nii.gz', 'wb') as f:
            f.write(image._content) 

        buffer = mriUtil.results('mri.nii.gz')

        return buffer
    
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/retinopathy', methods=['GET'])
def Retinopathy():
    try:
        json  = request.get_json() 

        data = json['user']

        res = retinopathy.predict(data)

        if(res==1):
            response = "The Patient has been diagonsed with Diabetic Retinopathy"
        else : 
            response = "The Patient has not been diagonsed with Diabetic Retinopathy"

        return response
    
    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/riskOfDeath', methods=['GET'])
def RiskOfDeath():
    try:
        json  = request.get_json() 

        data = json['user']

        res = riskOfDeath.predict(data)

        if(res==1):
            response = "The Patient is at Risk of Death"
        else : 
            response = "The Patient is not at Risk of Death"

        return response

    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/recommendcompound', methods=['GET'])
def RecommendCompound():
    try:
        json  = request.get_json() 

        data = json['conditions']

        res = recommendCompound.predict(data)

        return res

    except Exception as e:
        return {"error": str(e)}, 500

@app.route('/template', methods=['POST'])
def Template():
    try:
        data = request.get_json()

        print(data)


        file = requests.get(url+data['file'])

        print(file._content)
        

        res = template.get_data(file._content, data['lab_name'], data['lab_type'])

        response = jsonpickle.encode(res)

        return response
    
    except Exception as e:
        return {"error": str(e)}, 500
    
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
    app.run(host='0.0.0.0', port=5000, debug=True)

